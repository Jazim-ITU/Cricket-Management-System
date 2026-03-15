const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cricket Management System API',
      version: '1.0.0',
      description: 'Backend API for the Cricket Management System — Phase 2',
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
        Player: {
          type: 'object',
          properties: {
            player_id: { type: 'integer' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            date_of_birth: { type: 'string', format: 'date' },
            role: { type: 'string', enum: ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'] },
            batting_style: { type: 'string' },
            bowling_style: { type: 'string' },
            nationality: { type: 'string' },
            team_id: { type: 'integer' },
          },
        },
        Team: {
          type: 'object',
          properties: {
            team_id: { type: 'integer' },
            team_name: { type: 'string' },
            city: { type: 'string' },
            founded_year: { type: 'integer' },
          },
        },
        Match: {
          type: 'object',
          properties: {
            match_id: { type: 'integer' },
            tournament_id: { type: 'integer' },
            venue_id: { type: 'integer' },
            team1_id: { type: 'integer' },
            team2_id: { type: 'integer' },
            match_date: { type: 'string', format: 'date' },
            start_time: { type: 'string' },
            end_time: { type: 'string' },
            winner_team_id: { type: 'integer' },
          },
        },
        Tournament: {
          type: 'object',
          properties: {
            tournament_id: { type: 'integer' },
            tournament_name: { type: 'string' },
            start_date: { type: 'string', format: 'date' },
            end_date: { type: 'string', format: 'date' },
            format: { type: 'string', enum: ['T20', 'ODI', 'Test'] },
          },
        },
        Coach: {
          type: 'object',
          properties: {
            coach_id: { type: 'integer' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            specialization: { type: 'string' },
            experience_years: { type: 'integer' },
            team_id: { type: 'integer' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);