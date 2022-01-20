#!/usr/bin/env ruby
# frozen_string_literal: true

# =========================================== Database =========================================== #

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

  datetime :created_at, null: false
  datetime :updated_at, null: false
end

# =========================================== Rest API =========================================== #

require 'sinatra'
require 'sinatra/json'
require 'sinatra/namespace'

set :environment, 'production'
set :public_folder, File.join(__dir__, 'dist')

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end

namespace '/api' do
  before { content_type :json }

  namespace '/cards' do
    get do
      json DB[:cards].all
    end

    get '/:id' do
      card = DB[:cards][id: params[:id]]
      halt(404) if card.nil?
      json(card)
    end

    post do
    end

    put '/:id' do
    end

    delete '/:id' do
      card = DB[:cards][id: params[:id]]
      halt(404) if card.nil?
      DB[:cards].where(id: params[:id]).delete == 1 ? halt(200) : halt(400)
    end
  end

  not_found { '' }
end
