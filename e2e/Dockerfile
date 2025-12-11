FROM mcr.microsoft.com/playwright:v1.55.1-jammy

WORKDIR /app

COPY . .

# Install helpers so the container can install Bun
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y unzip && \
    rm -rf /var/lib/apt/lists/*

# Install Bun so the container can install and run the e2e tooling
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

WORKDIR /app/e2e
RUN bun install
RUN bunx playwright install --with-deps

CMD ["bun", "run", "test", "--prefix", "e2e"]
