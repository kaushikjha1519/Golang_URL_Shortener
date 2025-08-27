package main

import (
	"fmt"
	"golang_url_shortener/routes"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func setupRoutes(app *fiber.App) {

	app.Get("/:url", routes.ResolveURL)
	app.Post("/api/v1", routes.ShortenURL)

}

func main() {

	err := godotenv.Load()

	if err != nil {

		fmt.Println(err)
	}

	app := fiber.New()

	// Ensure CORS headers are always present and preflight (OPTIONS) returns 204
	app.Use(func(c *fiber.Ctx) error {
		c.Set("Access-Control-Allow-Origin", "*")
		c.Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
		c.Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Method() == fiber.MethodOptions {
			return c.SendStatus(fiber.StatusNoContent)
		}
		return c.Next()
	})

	// Keep Fiber CORS as well (harmless with the above middleware)
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowMethods:     "GET,POST,OPTIONS",
		AllowHeaders:     "Content-Type,Authorization",
		AllowCredentials: false,
	}))

	app.Use(logger.New())

	setupRoutes(app)

	log.Fatal(app.Listen(os.Getenv("APP_PORT")))

}
