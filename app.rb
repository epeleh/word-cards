#!/usr/bin/env ruby
# frozen_string_literal: true

# ===================================================== Database ===================================================== #

require 'fileutils'
require 'sqlite3'
require 'sequel'

Sequel.default_timezone = :utc

DB = File.join(__dir__, 'storage', 'db.sqlite').then do |filepath|
  FileUtils.mkdir(File.dirname(filepath)) unless File.directory?(File.dirname(filepath))
  Sequel.sqlite filepath
end

DB.create_table? :cards do
  primary_key :id

  string :text, unique: true, null: false
  string :translation, null: false

  datetime :met_at, null: false
  boolean :remembered, null: false, default: false

  boolean :active, null: false, default: true

  datetime :created_at, null: false
  datetime :updated_at, null: false
end

# ===================================================== Rest API ===================================================== #

require 'sinatra'
require 'sinatra/namespace'

set :public_folder, File.join(__dir__, 'dist')

def validate_card_body!
  data = JSON.parse(request.body.tap(&:rewind).read)
  errors = %w[text translation met_at remembered active].zip([]).to_h.transform_values { [] }

  if data['text'].nil?
    errors['text'] << 'cannot be null'
  elsif !data['text'].is_a?(String)
    errors['text'] << 'should be a string'
  elsif !DB[:cards].exclude(id: params[:id]).where(text: data['text']).empty?
    errors['text'] << 'should be unique'
  end

  if data['translation'].nil?
    errors['translation'] << 'cannot be null'
  elsif !data['translation'].is_a?(String)
    errors['translation'] << 'should be a string'
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

  errors['remembered'] << 'should be Boolean' if data.key?('remembered') && ![true, false].include?(data['remembered'])
  errors['active'] << 'should be Boolean' if data.key?('active') && ![true, false].include?(data['active'])

  errors.reject! { |_, v| v.empty? }
  return if errors.empty?

  halt 400, nil, errors.to_json
end

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end

namespace '/api' do
  before { content_type :json }

  error JSON::ParserError do
    status 400
    { message: "invalid json format: #{env['sinatra.error'].message}" }.to_json
  end

  namespace '/cards' do
    get do
      DB[:cards].all.to_json
    end

    get '/next' do
      halt(404) if DB[:cards].where(active: true).empty?

      remembered = [true, false].sample
      (
        DB[:cards].where(active: true, remembered:).order(:met_at).first ||
        DB[:cards].where(active: true, remembered: !remembered).order(:met_at).first
      ).to_json
    end

    get '/:id' do
      card = DB[:cards][id: params[:id]]
      halt(404) if card.nil?
      card.to_json
    end

    post do
      validate_card_body!

      current_time = Time.now.utc
      attributes = { 'met_at' => current_time, 'created_at' => current_time, 'updated_at' => current_time }.merge(
        JSON.parse(request.body.tap(&:rewind).read).slice('text', 'translation', 'met_at', 'remembered', 'active')
      )

      status 201
      DB[:cards][id: DB[:cards].insert(attributes)].to_json
    end

    put '/:id' do
      halt(404) if DB[:cards].where(id: params[:id]).empty?
      validate_card_body!

      attributes = { 'updated_at' => Time.now.utc }.merge(
        JSON.parse(request.body.tap(&:rewind).read).slice('text', 'translation', 'met_at', 'remembered', 'active')
      )

      halt(500) unless DB[:cards].where(id: params[:id]).update(attributes) == 1
      DB[:cards][id: params[:id]].to_json
    end

    delete '/:id' do
      halt(404) if DB[:cards].where(id: params[:id]).empty?
      DB[:cards].where(id: params[:id]).delete == 1 ? halt(200) : halt(500)
    end
  end
end

not_found { '' }
