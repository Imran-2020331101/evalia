// OpenAPI 3.0 specification for Upskill Engine
// Minimal, hand-authored spec to cover available routes
const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Evalia Upskill Engine API",
    version: "1.0.0",
    description: "Interactive API documentation for the Upskill Engine service.",
  },
  servers: [
    { url: "http://localhost:7000", description: "Local Dev" },
  ],
  paths: {
    "/api/health": {
      get: {
        summary: "Health check",
        responses: {
          200: {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, timestamp: { type: "string", format: "date-time" } } },
              },
            },
          },
        },
      },
    },
    "/api/jobs": {
      post: {
        summary: "Create a new job",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreateJobRequest" } },
          },
        },
        responses: {
          201: { description: "Job created", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponseJobCreated" } } } },
          400: { description: "Validation failed" },
          500: { description: "Server error" },
        },
      },
      get: {
        summary: "List all jobs",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 10 } },
          { in: "query", name: "sortBy", schema: { type: "string", default: "createdAt" } },
          { in: "query", name: "sortOrder", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
          { in: "query", name: "status", schema: { type: "string", enum: ["DRAFT", "ACTIVE", "FILLED", "ARCHIVED", "DELETED"] } },
        ],
        responses: {
          200: { description: "Jobs retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponseJobsWithPagination" } } } },
          400: { description: "Invalid query" },
          500: { description: "Server error" },
        },
      },
    },
    "/api/jobs/{jobId}": {
      get: {
        summary: "Get job by ID",
        parameters: [ { in: "path", name: "jobId", required: true, schema: { type: "string" } } ],
        responses: {
          200: { description: "Job details", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponseJob" } } } },
          400: { description: "Invalid job ID" },
          404: { description: "Job not found" },
          500: { description: "Server error" },
        },
      },
      delete: {
        summary: "Delete job",
        parameters: [ { in: "path", name: "jobId", required: true, schema: { type: "string" } } ],
        responses: {
          200: { description: "Deleted" },
          404: { description: "Job not found" },
          500: { description: "Server error" },
        },
      },
    },
    "/api/jobs/{jobId}/status": {
      put: {
        summary: "Update job status",
        parameters: [ { in: "path", name: "jobId", required: true, schema: { type: "string" } } ],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { type: "object", properties: { status: { type: "string", enum: ["DRAFT", "ACTIVE", "FILLED", "ARCHIVED", "DELETED"] } }, required: ["status"] } },
          },
        },
        responses: {
          200: { description: "Updated" },
          400: { description: "Invalid status" },
          404: { description: "Job not found" },
          500: { description: "Server error" },
        },
      },
    },
    "/api/jobs/company/{companyName}": {
      get: {
        summary: "Get jobs by company",
        parameters: [
          { in: "path", name: "companyName", required: true, schema: { type: "string" } },
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 10 } },
          { in: "query", name: "sortBy", schema: { type: "string", default: "createdAt" } },
          { in: "query", name: "sortOrder", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
          { in: "query", name: "status", schema: { type: "string", enum: ["DRAFT", "ACTIVE", "FILLED", "ARCHIVED", "DELETED"] } },
        ],
        responses: {
          200: { description: "Jobs retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponseJobsWithPagination" } } } },
          400: { description: "Invalid query" },
          500: { description: "Server error" },
        },
      },
    },
    "/api/overview": {
      post: {
        summary: "Generate resume overview vs job description",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", properties: { resumeId: { type: "string" }, jobId: { type: "string" } }, required: ["resumeId", "jobId"] },
            },
          },
        },
        responses: {
          200: {
            description: "Overview generated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        resume: { $ref: "#/components/schemas/ExtractedResume" },
                        overview: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: "Validation failed" },
          404: { description: "Job not found" },
          500: { description: "Server error" },
        },
      },
    },
  },
  components: {
    schemas: {
      ExtractedResume: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          summary: { type: "string" },
          skills: { type: "array", items: { type: "string" } },
        },
      },
      CreateJobRequest: {
        type: "object",
        required: ["title", "jobDescription", "jobLocation", "salaryFrom", "salaryTo", "deadline", "jobType", "workPlaceType", "employmentLevel", "requirements", "responsibilities", "skills", "postedBy", "company"],
        properties: {
          title: { type: "string" },
          jobDescription: { type: "string" },
          jobLocation: { type: "string" },
          salaryFrom: { type: "number" },
          salaryTo: { type: "number" },
          deadline: { type: "string", format: "date-time" },
          jobType: { type: "string" },
          workPlaceType: { type: "string" },
          employmentLevel: { type: "string" },
          requirements: { type: "array", items: { type: "string" } },
          responsibilities: { type: "array", items: { type: "string" } },
          skills: { type: "array", items: { type: "string" } },
          postedBy: { type: "string" },
          company: { type: "object", additionalProperties: true },
        },
      },
      ApiResponseJob: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          data: { type: "object", additionalProperties: true },
        },
      },
      ApiResponseJobCreated: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          data: {
            type: "object",
            properties: {
              jobId: { type: "string" },
              title: { type: "string" },
              company: { type: "string" },
              status: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
      ApiResponseJobsWithPagination: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          data: {
            type: "object",
            properties: {
              jobs: { type: "array", items: { type: "object", additionalProperties: true } },
              pagination: {
                type: "object",
                properties: {
                  currentPage: { type: "integer" },
                  totalPages: { type: "integer" },
                  totalCount: { type: "integer" },
                  hasNextPage: { type: "boolean" },
                  hasPrevPage: { type: "boolean" },
                  limit: { type: "integer" },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

export default openApiSpec;
