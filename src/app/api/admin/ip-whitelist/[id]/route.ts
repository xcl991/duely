import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin/auth';
import {
  updateIPWhitelist,
  removeIPFromWhitelist,
} from '@/lib/admin/ip-whitelist';

/**
 * PUT /api/admin/ip-whitelist/[id]
 * Update IP whitelist entry
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { description, isActive } = body;

    const updateData: any = {};
    if (description !== undefined) {
      updateData.description = description;
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const result = await updateIPWhitelist(params.id, updateData);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      entry: result.entry,
    });
  } catch (error) {
    console.error('Error updating IP whitelist entry:', error);
    return NextResponse.json(
      { error: 'Failed to update IP whitelist entry' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/ip-whitelist/[id]
 * Remove IP from whitelist
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await removeIPFromWhitelist(params.id);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Error removing IP from whitelist:', error);
    return NextResponse.json(
      { error: 'Failed to remove IP from whitelist' },
      { status: 500 }
    );
  }
}
