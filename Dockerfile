FROM ruby:3.1.0

WORKDIR /app
COPY . .

RUN bundle config --global frozen 1
RUN bundle install --without development

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - \
  && apt-get update -qq && apt-get install -qq --no-install-recommends nodejs \
  && apt-get upgrade -qq \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

RUN npm install
RUN npm run build

RUN rm -rf .browserslistrc .eslintrc.js babel.config.js \
  node_modules/ package-lock.json package.json public/ src/

EXPOSE 80
CMD ["bundle", "exec", "./server.rb", "-e", "production", "-p", "80"]
