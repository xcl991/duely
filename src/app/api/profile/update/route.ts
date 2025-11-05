import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  image: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: validatedData.name,
        ...(validatedData.image !== undefined && { image: validatedData.image }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
