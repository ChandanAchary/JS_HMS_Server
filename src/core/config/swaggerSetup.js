/**
 * Swagger UI Setup
 * Mounts Swagger documentation at /api-docs
 */

import swaggerUi from 'swagger-ui-express';
import swaggerConfig from './swagger.js';

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(swaggerConfig, {
    swaggerOptions: {
      deepLinking: true,
      // Some versions of swagger-ui-express expose presets differently;
      // guard access to avoid server crash if not present.
      presets: [
        ...(swaggerUi.presets && [swaggerUi.presets.apis] || []),
        ...(swaggerUi.SwaggerUIBundle && swaggerUi.SwaggerUIBundle.presets && [swaggerUi.SwaggerUIBundle.presets.apis] || []),
      ].filter(Boolean),
    },
    customCss: `
      .swagger-ui .topbar { display: none; }
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
      .swagger-ui .info .title { font-size: 2em; color: #1976d2; }
      .swagger-ui .scheme-container { background: #f5f5f5; }
      .swagger-ui .btn { border-radius: 4px; }
      .swagger-ui .model-box { background: #f9f9f9; border-left: 4px solid #1976d2; }
    `,
    customJs: [
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-bundle.js',
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-standalone-preset.js',
    ],
  }));

  // Also serve JSON spec at /api-spec.json
  app.get('/api-spec.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerConfig);
  });
};

export default setupSwagger;



















