const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Mail Mind - Smarter Emails",
      version: "1.0.0",
      description:
        "Mail Mind is an intelligent email management tool that leverages advanced natural language processing (NLP) techniques to automate email handling and response processes. Seamlessly integrating with Gmail and Outlook APIs through OAuth2 authentication, Mail Mind categorizes incoming emails and generates personalized automated replies tailored to their content.",
      contact: {
        name: "Anil",
        email: "kanilreddy867@gmail.com",
      },
    },
    servers: [
      {
        url: "https://mail-mind.cyclic.app/",
      },
    ],
    tags: [
      {
        name: "Gmail",
        description: "Endpoints related to Gmail integration",
      },
      {
        name: "Outlook",
        description: "Endpoints related to Outlook integration",
      },
    ],
  },
  apis: ["./routes/**/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
