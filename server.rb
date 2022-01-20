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

set :environment, 'production'
set :public_folder, File.join(__dir__, 'dist')

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end
