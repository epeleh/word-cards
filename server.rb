#!/usr/bin/env ruby
# frozen_string_literal: true

# ===================================================== Database ===================================================== #

require 'fileutils'
require 'sqlite3'
require 'sequel'
require 'logger'

STORAGE_FOLDER = File.join(__dir__, 'storage').freeze
FileUtils.mkdir_p STORAGE_FOLDER

DB = Sequel.sqlite File.join(STORAGE_FOLDER, 'db.sqlite')
Sequel.default_timezone = :utc

DB.create_table? :cards do
  primary_key :id

  text :text, unique: true, null: false
  text :translation, null: false
  text :image_path

  datetime :met_at, null: false
  boolean :remembered, null: false, default: false

  boolean :active, null: false, default: true

  datetime :created_at, null: false
  datetime :updated_at, null: false
end

# Synchronize storage images and database records
DB[:cards].exclude(image_path: nil).select_map(:id).then do |ids_of_cards_with_an_image|
  storage_images = Dir[File.join(STORAGE_FOLDER, 'card_*.*')]
  extract_id_from_image_filepath = ->(path) { File.basename(path, File.extname(path)).delete_prefix('card_').to_i }

  needless_images = storage_images.reject do |image|
    ids_of_cards_with_an_image.include? extract_id_from_image_filepath.call(image)
  end

  File.delete(*needless_images)

  ids_of_cards_with_a_lost_image = ids_of_cards_with_an_image - storage_images.map(&extract_id_from_image_filepath)
  DB[:cards].where(id: ids_of_cards_with_a_lost_image).update(image_path: nil, updated_at: Time.now.utc)
end

DB.logger = Logger.new($stdout)
DB.loggers.first.formatter = proc do |severity, datetime, _progname, msg|
  "DB - #{severity} - [#{datetime.strftime('%d/%b/%Y:%T %z')}] #{msg}\n"
end

# ===================================================== Rest API ===================================================== #

require 'sinatra'
require 'sinatra/namespace'
require 'archive/zip'

set :public_folder, File.join(__dir__, 'dist')

def id_param_invalid?
  !/\A[1-9]+\d*\z/.match?(params[:id])
end

def request_body_data
  JSON.parse request.body.tap(&:rewind).read
end

def validate_card_body!
  data = request_body_data
  errors = %w[text translation met_at remembered active].zip([]).to_h.transform_values { [] }

  if data['text'].nil?
    errors['text'] << 'cannot be null'
  elsif !data['text'].is_a?(String)
    errors['text'] << 'should be a string'
  elsif data['text'].strip.empty?
    errors['text'] << 'cannot be blank'
  elsif !DB[:cards].exclude(id: params[:id]).where(text: data['text'].strip).empty?
    errors['text'] << 'should be unique'
  end

  if data['translation'].nil?
    errors['translation'] << 'cannot be null'
  elsif !data['translation'].is_a?(String)
    errors['translation'] << 'should be a string'
  elsif data['translation'].strip.empty?
    errors['translation'] << 'cannot be blank'
  end

  if data['met_at'].nil?
    nil
  elsif !data['met_at'].is_a?(String)
    errors['met_at'] << 'should be a string'
  elsif !data['met_at'].match?(/\A\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC\z/) || !begin
    !!Date.strptime(data['met_at'], '%F %T UTC')
  rescue Date::Error
    false
  end
    errors['met_at'] << 'invalid date format'
  end

  %w[remembered active].each do |param|
    errors[param] << 'should be Boolean' if data.key?(param) && ![true, false].include?(data.fetch(param))
  end

  errors.reject! { |_, v| v.empty? }
  return if errors.empty?

  halt 400, nil, errors.to_json
end

namespace '/api' do
  before do
    content_type :json

    if settings.development?
      headers 'Access-Control-Allow-Origin' => '*'
      headers 'Access-Control-Allow-Methods' => '*'

      halt 200 if request.request_method == 'OPTIONS'
    end
  end

  error JSON::ParserError do
    status 400
    { message: "invalid json format: #{env['sinatra.error'].message}" }.to_json
  end

  namespace '/cards' do
    cards_cache = {}
    get do # This route uses "cards_cache" to optimize response speed
      db_connection_total_changes = DB.select(Sequel.function(:total_changes)).single_value

      # Select records from the "cards" table only if there have been any changes in the database
      unless cards_cache.key?(db_connection_total_changes)
        cards_cache = { db_connection_total_changes => DB[:cards].all }
      end

      cards_cache.fetch(db_connection_total_changes).to_json
    end

    get '/next' do
      remembered = DB[:cards].where(active: true).order(Sequel.function(:random)).get(:remembered)
      halt(404) if remembered.nil?

      DB[:cards].where(active: true, remembered:).order(:met_at).first.to_json
    end

    get '/:id' do
      halt(404) if id_param_invalid?

      card = DB[:cards][id: params[:id]]
      halt(404) if card.nil?

      card.to_json
    end

    post '/:id/image' do
      halt(404) if id_param_invalid? || DB[:cards].where(id: params[:id]).empty?
      halt(400) if params.dig('image', 'tempfile').nil? || !params.dig('image', 'type').start_with?('image/')

      dist = File.join(STORAGE_FOLDER, "card_#{params[:id]}#{File.extname(params.dig('image', 'tempfile'))}")
      FileUtils.cp(params.dig('image', 'tempfile').path, dist)

      halt(500) unless DB[:cards].where(id: params[:id]).update(
        image_path: "/storage/#{File.basename(dist)}", updated_at: Time.now.utc
      ) == 1

      File.delete(
        *Dir[File.join(STORAGE_FOLDER, "card_#{params[:id]}.*")].reject do |image|
          File.extname(image) == File.extname(dist)
        end
      )

      status 201
      DB[:cards][id: params[:id]].to_json
    end

    post do
      validate_card_body!

      current_time = Time.now.utc
      attributes = { 'met_at' => current_time, 'created_at' => current_time, 'updated_at' => current_time }.merge(
        request_body_data.slice('text', 'translation', 'met_at', 'remembered', 'active')
      ).transform_keys(&:to_sym)

      attributes[:text].strip!
      attributes[:translation].strip!

      status 201
      DB[:cards][id: DB[:cards].insert(attributes)].to_json
    end

    put '/:id' do
      halt(404) if id_param_invalid? || DB[:cards].where(id: params[:id]).empty?
      validate_card_body!

      attributes = request_body_data.slice(
        'text', 'translation', 'met_at', 'remembered', 'active'
      ).transform_keys(&:to_sym)

      attributes[:translation].strip!
      attributes[:text].strip!

      attributes.merge!(updated_at: Time.now.utc) if DB[:cards].where(
        attributes.slice(:text, :translation, :active).merge(id: params[:id])
      ).empty?

      halt(500) unless DB[:cards].where(id: params[:id]).update(attributes) == 1
      DB[:cards][id: params[:id]].to_json
    end

    delete '/:id/image' do
      halt(404) if id_param_invalid? || DB[:cards].exclude(image_path: nil).where(id: params[:id]).empty?

      halt(500) unless DB[:cards].where(id: params[:id]).update(image_path: nil, updated_at: Time.now.utc) == 1
      File.delete(*Dir[File.join(STORAGE_FOLDER, "card_#{params[:id]}.*")])

      DB[:cards][id: params[:id]].to_json
    end

    delete '/:id' do
      halt(404) if id_param_invalid? || DB[:cards].where(id: params[:id]).empty?

      halt(500) unless DB[:cards].where(id: params[:id]).delete == 1
      File.delete(*Dir[File.join(STORAGE_FOLDER, "card_#{params[:id]}.*")])

      halt(200)
    end
  end

  get('*') { halt 404 }
end

namespace '/storage' do
  get '/:filename' do
    send_file File.join(STORAGE_FOLDER, params[:filename])
  end

  get '.zip' do
    zipfile = File.join(Dir.mktmpdir, "storage-#{Time.now.utc.strftime('%Y%m%d%H%M%S')}.zip")
    Archive::Zip.archive(zipfile, STORAGE_FOLDER)

    send_file zipfile, filename: File.basename(zipfile)
  end

  get('*') { halt 404 }
end

get '*' do
  send_file File.join(settings.public_folder, 'index.html')
end
