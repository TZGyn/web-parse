FROM oven/bun:debian

# NodeJS app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV=production


# Throw-away build stage to reduce size of final image

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y python-is-python3 python3-pip pkg-config build-essential chromium ca-certificates \
						libgtk-3-0 libx11-xcb1 libasound2

RUN pip install --user pipx
RUN pipx install camoufox

COPY ./package.json ./
COPY ./bun.lock ./

RUN bun install

COPY . .
# COPY ./.env.example ./.env

RUN bun run build

EXPOSE 3000

ENTRYPOINT ["bun", "build/index.js"]

