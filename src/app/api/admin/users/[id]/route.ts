import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/admin/auth';

// GET /api/admin/users/[id] - Get user details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        subscriptions: {
          select: {
            id: true,
            serviceName: true,
            status: true,
            amount: true,
            billingFrequency: true,
          },
        },
        categories: { select: { id: true, name: true } },
        members: { select: { id: true, name: true } },
        _count: {
          select: {
            subscriptions: true,
            categories: true,
            members: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - Update user information
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, username, subscriptionPlan, subscriptionStatus } = body;

    // Validate subscription plan
    const validPlans = ['free', 'pro', 'business'];
    if (subscriptionPlan && !validPlans.includes(subscriptionPlan)) {
      return NextResponse.json(
        { error: 'Invalid subscription plan' },
        { status: 400 }
      );
    }

    // Validate subscription status
    const validStatuses = ['active', 'trial', 'canceled', 'expired'];
    if (subscriptionStatus && !validStatuses.includes(subscriptionStatus)) {
      return NextResponse.json(
        { error: 'Invalid subscription status' },
        { status: 400 }
      );
    }

    // Get current user data for logging
    const currentUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        name: true,
        username: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if username is being changed and if it's unique
    if (username && username !== currentUser.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser && existingUser.id !== params.id) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: name || currentUser.name,
        username: username || currentUser.username,
        subscriptionPlan: subscriptionPlan || currentUser.subscriptionPlan,
        subscriptionStatus: subscriptionStatus || currentUser.subscriptionStatus,
      },
    });

    // Get IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

    // Log the action
    await logAdminAction({
      adminId: admin.id,
      action: 'user_updated',
      details: `Updated user: ${updatedUser.email}`,
      ipAddress: ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
      metadata: {
        userId: updatedUser.id,
        before: currentUser,
        after: {
          name: updatedUser.name,
          username: updatedUser.username,
          subscriptionPlan: updatedUser.subscriptionPlan,
          subscriptionStatus: updatedUser.subscriptionStatus,
        },
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cannot delete self
    if (admin.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Get user with cascade info
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            subscriptions: true,
            categories: true,
            members: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: params.id },
    });

    // Get IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

    // Log the action
    await logAdminAction({
      adminId: admin.id,
      action: 'user_deleted',
      details: `Deleted user: ${user.email}`,
      ipAddress: ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
      metadata: {
        userId: user.id,
        userEmail: user.email,
        cascadeDeleted: {
          subscriptions: user._count.subscriptions,
          categories: user._count.categories,
          members: user._count.members,
        },
      },
    });

    return NextResponse.json({
      message: 'User deleted successfully',
      cascadeInfo: {
        subscriptions: user._count.subscriptions,
        categories: user._count.categories,
        members: user._count.members,
      },
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
