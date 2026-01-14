/**
 * Float.js Type-Safe API Route Example
 * 
 * This demonstrates automatic validation - no Zod needed!
 * Try sending invalid data and see the beautiful error messages.
 */

import { typedRoute, f, json, error } from '@float/core';

// Define the schema for user creation
const createUserSchema = f.object({
  name: f.string().min(2, 'Name must be at least 2 characters').max(50),
  email: f.string().email('Please provide a valid email'),
  age: f.number().min(13, 'Must be at least 13 years old').int().optional(),
  role: f.enum(['admin', 'user', 'moderator'] as const).optional(),
  tags: f.array(f.string()).max(10).optional(),
  preferences: f.object({
    theme: f.enum(['light', 'dark', 'system'] as const),
    notifications: f.boolean(),
  }).optional(),
});

// POST /api/users - Create a new user
export const POST = typedRoute({
  body: createUserSchema,
}, async (req) => {
  // 🎉 req.validated.body is FULLY TYPED!
  // TypeScript knows: name (string), email (string), age (number | undefined), etc.
  const { name, email, age, role, tags, preferences } = req.validated.body;

  // Simulate user creation
  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    age: age ?? null,
    role: role ?? 'user',
    tags: tags ?? [],
    preferences: preferences ?? { theme: 'system', notifications: true },
    createdAt: new Date().toISOString(),
  };

  return json({ 
    success: true, 
    user,
    message: `Welcome to Float.js, ${name}! 🚀` 
  }, { status: 201 });
});

// GET /api/users?page=1&limit=10 - List users with pagination
export const GET = typedRoute({
  query: f.object({
    page: f.number().min(1).optional(),
    limit: f.number().min(1).max(100).optional(),
    search: f.string().optional(),
    role: f.enum(['admin', 'user', 'moderator'] as const).optional(),
  }),
}, async (req) => {
  const { page = 1, limit = 10, search, role } = req.validated.query;

  // Mock data
  const users = [
    { id: '1', name: 'Alice', email: 'alice@example.com', role: 'admin' },
    { id: '2', name: 'Bob', email: 'bob@example.com', role: 'user' },
    { id: '3', name: 'Charlie', email: 'charlie@example.com', role: 'moderator' },
  ];

  // Filter by role if provided
  let filtered = role ? users.filter(u => u.role === role) : users;
  
  // Filter by search if provided
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(u => 
      u.name.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower)
    );
  }

  // Paginate
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return json({
    data: paginated,
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  });
});

// DELETE /api/users - Bulk delete users
export const DELETE = typedRoute({
  body: f.object({
    ids: f.array(f.string().uuid('Each ID must be a valid UUID')).nonempty('At least one ID required'),
    reason: f.string().min(10, 'Please provide a detailed reason').optional(),
  }),
}, async (req) => {
  const { ids, reason } = req.validated.body;

  // Simulate deletion
  console.log(`Deleting ${ids.length} users. Reason: ${reason || 'Not provided'}`);

  return json({
    success: true,
    deleted: ids.length,
    message: `Successfully deleted ${ids.length} user(s)`,
  });
});
