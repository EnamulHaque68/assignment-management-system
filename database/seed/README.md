Seed data for this project is created automatically by the backend
(`AssignmentManagement.Infrastructure/Services/SeedService.cs`) the first
time the API starts, since MongoDB does not use EF Core-style migrations.

There is nothing to run manually here - just start MongoDB and then the
API (see the root README). This folder is kept as a placeholder in case
you want to add exported `mongoexport`/`mongoimport` JSON fixtures later.
