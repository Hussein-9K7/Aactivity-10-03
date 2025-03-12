const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/userModel");

describe("User Routes", () => {
    beforeAll(async () => {
        const uri = 'mongodb://localhost:27017/W8-Auth-Test';
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    describe("POST /api/users/signup", () => {
        it("should successfully sign up a new user", async () => {
            const newUser = {
                name: "Test User",
                username: "testuser",
                password: "password123",
                phone_number: "1234567890",
                gender: "Male",
                date_of_birth: "2000-01-01",
                role: "user",
                address: {
                    street: "123 Test St",
                    city: "Test City",
                    state: "Test State",
                    zipCode: "12345",
                },
            };

            const res = await request(app).post("/api/users/signup").send(newUser);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("username");
            expect(res.body).toHaveProperty("token");
        });

        it("should return an error if required fields are missing", async () => {
            const newUser = {
                name: "Test User",
                username: "testuser",
                password: "password123",
                phone_number: "1234567890",
                gender: "Male",
                date_of_birth: "2000-01-01",
            };

            const res = await request(app).post("/api/users/signup").send(newUser);
            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Please add all fields");
        });

        it("should return an error if the user already exists", async () => {
            const existingUser = {
                name: "Test User",
                username: "testuser",
                password: "password123",
                phone_number: "1234567890",
                gender: "Male",
                date_of_birth: "2000-01-01",
                role: "user",
                address: {
                    street: "123 Test St",
                    city: "Test City",
                    state: "Test State",
                    zipCode: "12345",
                },
            };

            await request(app).post("/api/users/signup").send(existingUser);

            const res = await request(app).post("/api/users/signup").send(existingUser);
            expect(res.status).toBe(400);
            expect(res.body.error).toBe("User already exists");
        });
    });

    describe("POST /api/users/login", () => {
        it("should successfully log in a user", async () => {
            const newUser = {
                name: "Test User",
                username: "testuser",
                password: "password123",
                phone_number: "1234567890",
                gender: "Male",
                date_of_birth: "2000-01-01",
                role: "user",
                address: {
                    street: "123 Test St",
                    city: "Test City",
                    state: "Test State",
                    zipCode: "12345",
                },
            };

            await request(app).post("/api/users/signup").send(newUser);

            const res = await request(app)
                .post("/api/users/login")
                .send({
                    username: "testuser",
                    password: "password123",
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("username");
            expect(res.body).toHaveProperty("token");
        });

        it("should return an error if credentials are invalid", async () => {
            const res = await request(app)
                .post("/api/users/login")
                .send({
                    email: "nonexistentuser",
                    password: "wrongpassword",
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Invalid credentials");
        });
    });
});
