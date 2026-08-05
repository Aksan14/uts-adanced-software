package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBUser    string
	DBPass    string
	DBHost    string
	DBPort    string
	DBName    string
	JWTSecret string
	Port      string
}

func LoadConfig() Config {
	_ = godotenv.Load()
	
	// Fallbacks for testing contexts
	if os.Getenv("DB_USER") == "" {
		_ = godotenv.Load("../.env")
		_ = godotenv.Load("../../.env")
	}

	return Config{
		DBUser:    getEnv("DB_USER", "root"),
		DBPass:    getEnv("DB_PASSWORD", "Root123!"),
		DBHost:    getEnv("DB_HOST", "127.0.0.1"),
		DBPort:    getEnv("DB_PORT", "3306"),
		DBName:    getEnv("DB_NAME", "koshub"),
		JWTSecret: getEnv("JWT_SECRET", "supersecretjwtkeyforkoshubreservationapp123!"),
		Port:      getEnv("PORT", "8080"),
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
