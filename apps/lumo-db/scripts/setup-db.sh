#!/bin/bash

# Lumo DB Setup Script
# Handles database creation, user setup, extensions, and migrations

set -e

# Configuration
CONTAINER_NAME="lumo-db-dev"
DB_NAME="lumo"
DB_USER="lumo"
DB_PASSWORD="password"
ADMIN_USER="lumo"
ADMIN_PASSWORD="password"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if container is running
check_container() {
    if ! docker ps --format "table {{.Names}}" | grep -q "^$CONTAINER_NAME$"; then
        log_error "Container '$CONTAINER_NAME' is not running. Please start it first with: npm run dev"
        exit 1
    fi
}

# Wait for database to be ready
wait_for_db() {
    log_info "Waiting for PostgreSQL to be ready..."
    for i in $(seq 1 30); do
        if docker exec $CONTAINER_NAME pg_isready -U $ADMIN_USER >/dev/null 2>&1; then
            log_success "PostgreSQL is ready"
            return 0
        fi
        log_info "Waiting for PostgreSQL... ($i/30)"
        sleep 2
    done
    log_error "PostgreSQL failed to become ready after 30 attempts"
    exit 1
}

# Create database if it doesn't exist
create_database() {
    log_info "Creating database '$DB_NAME' if it doesn't exist..."
    
    # Check if database exists
    DB_EXISTS=$(docker exec $CONTAINER_NAME psql -U $ADMIN_USER -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null || echo "")
    
    if [ -z "$DB_EXISTS" ]; then
        log_info "Creating database '$DB_NAME'..."
        docker exec $CONTAINER_NAME psql -U $ADMIN_USER -c "CREATE DATABASE $DB_NAME;"
        log_success "Database '$DB_NAME' created"
    else
        log_warning "Database '$DB_NAME' already exists"
    fi
}

# Create user if it doesn't exist
create_user() {
    log_info "Creating user '$DB_USER' if it doesn't exist..."
    
    docker exec $CONTAINER_NAME psql -U $ADMIN_USER -c "
        DO \$\$ 
        BEGIN 
            CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD'; 
            RAISE NOTICE 'User $DB_USER created';
        EXCEPTION 
            WHEN duplicate_object THEN 
                RAISE NOTICE 'User $DB_USER already exists'; 
        END 
        \$\$;
    "
    
    # Grant privileges
    docker exec $CONTAINER_NAME psql -U $ADMIN_USER -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    log_success "User setup completed"
}

# Setup database permissions
setup_permissions() {
    log_info "Setting up database permissions..."
    
    # Grant schema privileges
    docker exec $CONTAINER_NAME psql -U $ADMIN_USER -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
    
    log_success "Permissions configured"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    export DATABASE_URL="postgres://$DB_USER:$DB_PASSWORD@localhost:5430/$DB_NAME?sslmode=disable"
    
    if command -v dbmate >/dev/null 2>&1; then
        dbmate up
    else
        log_warning "dbmate not found in PATH, using npx..."
        npx dbmate up
    fi
    
    log_success "Migrations completed"
}

# Main setup function
main() {
    log_info "Starting Lumo DB setup..."
    
    check_container
    wait_for_db
    create_database
    create_user
    setup_permissions
    run_migrations
    
    log_success "Database setup completed successfully!"
    log_info "Connection details:"
    log_info "  DATABASE_URL: postgres://$DB_USER:$DB_PASSWORD@localhost:5430/$DB_NAME?sslmode=disable"
}

# Run main function
main "$@" 