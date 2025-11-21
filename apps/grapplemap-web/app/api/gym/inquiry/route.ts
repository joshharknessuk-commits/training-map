import { NextRequest, NextResponse } from 'next/server';

interface GymInquiry {
  gymName: string;
  contactName: string;
  email: string;
  phone?: string;
  location: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GymInquiry = await request.json();
    const { gymName, contactName, email, phone, location, message } = body;

    // Validate required fields
    if (!gymName || !contactName || !email || !location) {
      return NextResponse.json(
        { error: 'Missing required fields: gymName, contactName, email, and location are required' },
        { status: 400 },
      );
    }

    // Validate email format
    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // TODO: Store inquiry in database
    // For now, log the inquiry - in production this would:
    // 1. Store in a gym_inquiries table
    // 2. Send notification email to sales team
    // 3. Send confirmation email to the gym

    console.log('New gym inquiry received:', {
      gymName,
      contactName,
      email,
      phone,
      location,
      message,
      timestamp: new Date().toISOString(),
    });

    // TODO: Send email notification
    // await sendEmail({
    //   to: 'support@grapplemap.uk',
    //   subject: `New Gym Inquiry: ${gymName}`,
    //   body: `...`,
    // });

    // TODO: Send confirmation email to gym
    // await sendEmail({
    //   to: email,
    //   subject: 'Thanks for your interest in GrappleMap Network',
    //   body: `...`,
    // });

    return NextResponse.json({
      success: true,
      message: 'Inquiry received successfully. Our team will be in touch within 1-2 business days.',
    });
  } catch (error) {
    console.error('Gym inquiry error:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry' },
      { status: 500 },
    );
  }
}
