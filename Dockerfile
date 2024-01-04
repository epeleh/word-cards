FROM ruby:3.3.0

WORKDIR /app
COPY . .

RUN bundle config --global frozen 1 \
  && bundle config --global without development \
  && bundle install

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - \
  && apt-get update -qq \
  && apt-get install -qq --no-install-recommends nodejs \
  && apt-get upgrade -qq \
  && rm -rf /var/lib/apt/lists/* \
  && npm install \
  && npm run build \
  && rm -rf .browserslistrc .eslintrc.js babel.config.js vue.config.js \
  node_modules/ package-lock.json package.json public/ src/ \
  && apt-get purge nodejs -qq \
  && apt-get clean

EXPOSE 80
CMD ["bundle", "exec", "./server.rb", "-e", "production", "-p", "80", "-x"]
