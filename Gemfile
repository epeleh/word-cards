# frozen_string_literal: true

source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby File.read('.ruby-version').strip

gem 'archive-zip', '~> 0.12.0'
gem 'puma', '~> 5.5'
gem 'sequel', '~> 5.52'
gem 'sinatra', '~> 2.2'
gem 'sinatra-contrib', '~> 2.1'
gem 'sqlite3', '~> 1.4'

group :development do
  gem 'pry', '~> 0.14.1'
  gem 'rubocop', '~> 1.25'
  gem 'rubocop-sequel', '~> 0.3.3'
end
