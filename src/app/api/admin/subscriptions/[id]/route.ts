import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/admin/auth';

// GET /api/admin/subscriptions/[id] - Get subscription details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        member: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/subscriptions/[id] - Update subscription
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
    const { serviceName, amount, billingFrequency, nextBilling, status, notes } = body;

    // Validate billing frequency
    const validFrequencies = ['monthly', 'yearly', 'quarterly'];
    if (billingFrequency && !validFrequencies.includes(billingFrequency)) {
      return NextResponse.json(
        { error: 'Invalid billing frequency' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['active', 'trial', 'paused', 'canceled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid subscription status' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount && (isNaN(amount) || amount < 0)) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Get current subscription data for logging
    const currentSubscription = await prisma.subscription.findUnique({
      where: { id: params.id },
      select: {
        serviceName: true,
        amount: true,
        billingFrequency: true,
        nextBilling: true,
        status: true,
        notes: true,
        userId: true,
      },
    });

    if (!currentSubscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Update subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id: params.id },
      data: {
        serviceName: serviceName !== undefined ? serviceName : currentSubscription.serviceName,
        amount: amount !== undefined ? amount : currentSubscription.amount,
        billingFrequency: billingFrequency || currentSubscription.billingFrequency,
        nextBilling: nextBilling !== undefined
          ? (nextBilling ? new Date(nextBilling) : currentSubscription.nextBilling)
          : currentSubscription.nextBilling,
        status: status || currentSubscription.status,
        notes: notes !== undefined ? notes : currentSubscription.notes,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Get IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

    // Log the action
    await logAdminAction({
      adminId: admin.id,
      action: 'subscription_updated',
      details: `Updated subscription: ${updatedSubscription.serviceName} for ${updatedSubscription.user.email}`,
      ipAddress: ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
      metadata: {
        subscriptionId: updatedSubscription.id,
        userId: updatedSubscription.userId,
        before: currentSubscription,
        after: {
          serviceName: updatedSubscription.serviceName,
          amount: updatedSubscription.amount,
          billingFrequency: updatedSubscription.billingFrequency,
          nextBilling: updatedSubscription.nextBilling,
          status: updatedSubscription.status,
          notes: updatedSubscription.notes,
        },
      },
    });

    return NextResponse.json({ subscription: updatedSubscription });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/subscriptions/[id] - Delete subscription
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get subscription info before deletion
    const subscription = await prisma.subscription.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Delete subscription
    await prisma.subscription.delete({
      where: { id: params.id },
    });

    // Get IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

    // Log the action
    await logAdminAction({
      adminId: admin.id,
      action: 'subscription_deleted',
      details: `Deleted subscription: ${subscription.serviceName} for ${subscription.user.email}`,
      ipAddress: ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
      metadata: {
        subscriptionId: subscription.id,
        userId: subscription.userId,
        serviceName: subscription.serviceName,
        amount: subscription.amount,
      },
    });

    return NextResponse.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}
