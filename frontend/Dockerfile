# Multi-stage Dockerfile για το Vite React Frontend

# Στάδιο 1: Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Αντιγραφή αρχείων εξαρτήσεων
COPY package*.json ./

# Εγκατάσταση εξαρτήσεων
RUN npm ci

# Αντιγραφή πηγαίου κώδικα και κατασκευή production build
COPY . .
RUN npm run build

# Στάδιο 2: Production Serving Stage (με χρήση Caddy ή Nginx)
FROM caddy:2-alpine AS runtime

COPY --from=builder /app/dist /usr/share/caddy

EXPOSE 3000

CMD ["caddy", "file-server", "--listen", ":3000", "--root", "/usr/share/caddy"]
