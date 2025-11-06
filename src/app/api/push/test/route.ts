import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { sendTestPush } from '@/lib/push/push-service';

export async function POST(_request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`Sending test push to user ${user.id}`);

    const success = await sendTestPush(user.id);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Test notification sent successfully',
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'No active push subscriptions found',
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Test push error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}
