const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Property = require("../models/propertyModel");

const properties = [
    {
        title: "Luxury Apartment",
        type: "Apartment",
        description: "A beautiful luxury apartment in the city center.",
        price: 500000,
        location: {
            address: "123 Main St",
            city: "Cityville",
            state: "CA",
            zipCode: "12345"
        },
        squareFeet: 1200,
        yearBuilt: 2010
    },
    {
        title: "Cozy House",
        type: "House",
        description: "A cozy house with a large backyard.",
        price: 300000,
        location: {
            address: "456 Oak Rd",
            city: "Townsville",
            state: "TX",
            zipCode: "67890"
        },
        squareFeet: 1800,
        yearBuilt: 2005
    }
];

describe("Property Controller", () => {
    beforeEach(async () => {
        await Property.deleteMany({});
        await Property.insertMany(properties);
    });

    afterAll(() => {
        mongoose.connection.close();
    });

    it("should return all properties as JSON when GET /api/properties is called", async () => {
        const response = await api
            .get("/api/properties")
            .expect(200)
            .expect("Content-Type", /application\/json/);

        expect(response.body).toHaveLength(properties.length);
    });

    it("should create a new property when POST /api/properties is called", async () => {
        const newProperty = {
            title: "Modern Condo",
            type: "Condo",
            description: "A modern condo with stunning views.",
            price: 400000,
            location: {
                address: "789 Pine Blvd",
                city: "Metropolis",
                state: "NY",
                zipCode: "54321"
            },
            squareFeet: 1000,
            yearBuilt: 2015
        };

        await api
            .post("/api/properties")
            .send(newProperty)
            .expect(201)
            .expect("Content-Type", /application\/json/);

        const propertiesAfterPost = await Property.find({});
        expect(propertiesAfterPost).toHaveLength(properties.length + 1);
        const propertyTitles = propertiesAfterPost.map((property) => property.title);
        expect(propertyTitles).toContain(newProperty.title);
    });

    it("should return one property by ID when GET /api/properties/:id is called", async () => {
        const property = await Property.findOne();
        await api
            .get(`/api/properties/${property._id}`)
            .expect(200)
            .expect("Content-Type", /application\/json/);
    });

    it("should return 404 for a non-existing property ID", async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        await api.get(`/api/properties/${nonExistentId}`).expect(404);
    });

    it("should update one property with partial data when PUT /api/properties/:id is called", async () => {
        const property = await Property.findOne();
        const updatedProperty = {
            description: "Updated description for this property",
            price: 350000
        };

        await api
            .put(`/api/properties/${property._id}`)
            .send(updatedProperty)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        const updatedPropertyCheck = await Property.findById(property._id);
        expect(updatedPropertyCheck.description).toBe(updatedProperty.description);
        expect(updatedPropertyCheck.price).toBe(updatedProperty.price);
    });

    it("should return 400 for invalid property ID when PUT /api/properties/:id", async () => {
        const invalidId = "12345";
        await api.put(`/api/properties/${invalidId}`).send({}).expect(400);
    });

    it("should delete one property by ID when DELETE /api/properties/:id is called", async () => {
        const property = await Property.findOne();
        await api.delete(`/api/properties/${property._id}`).expect(204);

        const deletedPropertyCheck = await Property.findById(property._id);
        expect(deletedPropertyCheck).toBeNull();
    });

    it("should return 400 for invalid property ID when DELETE /api/properties/:id", async () => {
        const invalidId = "12345";
        await api.delete(`/api/properties/${invalidId}`).expect(400);
    });
});
