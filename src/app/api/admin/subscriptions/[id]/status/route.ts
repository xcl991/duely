import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/admin/auth';

// PATCH /api/admin/subscriptions/[id]/status - Change subscription status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['active', 'trial', 'paused', 'canceled'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid subscription status' },
        { status: 400 }
      );
    }

    // Get current subscription data
    const currentSubscription = await prisma.subscription.findUnique({
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

    if (!currentSubscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const previousStatus = currentSubscription.status;

    // Update subscription status
    const updatedSubscription = await prisma.subscription.update({
      where: { id: params.id },
      data: { status },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    // Get IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

    // Determine action type for logging
    let actionType = 'subscription_status_changed';
    if (status === 'canceled') {
      actionType = 'subscription_canceled';
    } else if (status === 'paused') {
      actionType = 'subscription_paused';
    } else if (status === 'active' && previousStatus === 'paused') {
      actionType = 'subscription_resumed';
    }

    // Log the action
    await logAdminAction({
      adminId: admin.id,
      action: actionType,
      details: `Changed subscription status: ${currentSubscription.serviceName} for ${currentSubscription.user.email} from ${previousStatus} to ${status}`,
      ipAddress: ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
      metadata: {
        subscriptionId: updatedSubscription.id,
        userId: updatedSubscription.userId,
        serviceName: updatedSubscription.serviceName,
        previousStatus,
        newStatus: status,
      },
    });

    return NextResponse.json({ subscription: updatedSubscription });
  } catch (error) {
    console.error('Error updating subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription status' },
      { status: 500 }
    );
  }
}
