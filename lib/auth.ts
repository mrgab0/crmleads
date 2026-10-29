import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from './mongodb';
import { User } from '@/models/User';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@lead.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';

        // 1. Fallback / Superadmin por variables de entorno
        if (
          credentials.email.toLowerCase() === adminEmail.toLowerCase() &&
          credentials.password === adminPassword
        ) {
          return {
            id: 'admin-env',
            email: adminEmail,
            name: 'Administrador',
            role: 'admin',
          };
        }

        // 2. Verificación en base de datos MongoDB si está configurada
        try {
          if (process.env.MONGODB_URI) {
            await connectToDatabase();
            const user = await User.findOne({ email: credentials.email.toLowerCase() });
            if (user && user.password === credentials.password) {
              return {
                id: user._id.toString(),
                email: user.email,
                name: user.name || 'Agente',
                role: user.role,
              };
            }
          }
        } catch (error) {
          console.error('Error verificando usuario en MongoDB:', error);
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role?: string }).role || 'agent';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as { id: string }).id = token.id as string;
        (session.user as unknown as { role: string }).role = (token.role as string) || 'agent';
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-lead-softphone-jwt-32-chars',
};

export default authOptions;
