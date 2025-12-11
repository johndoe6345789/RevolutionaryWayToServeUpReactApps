FROM mcr.microsoft.com/playwright:1.55.0-focal

WORKDIR /app

COPY . .

# Install Bun so the container can install and run the e2e tooling
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

WORKDIR /app/e2e
RUN bun install
RUN bunx playwright install --with-deps

CMD ["bun", "run", "test", "--prefix", "e2e"]
