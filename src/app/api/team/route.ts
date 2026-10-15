import { NextResponse } from 'next/server';
import { 
  getAllTeamMembers, 
  createTeamMember, 
  updateTeamMember, 
  deleteTeamMember 
} from '@/lib/teamStore';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;

    const teamMembers = await getAllTeamMembers(category);
    return NextResponse.json({
      success: true,
      teamMembers,
      total: teamMembers.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch team members.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.name || !body.role) {
      return NextResponse.json({ success: false, error: 'Name and role are required.' }, { status: 400 });
    }

    const created = await createTeamMember(body);
    return NextResponse.json({
      success: true,
      message: 'Team member created successfully.',
      teamMember: created
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create team member.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Team member ID required.' }, { status: 400 });
    }

    const updated = await updateTeamMember(id, updates);
    return NextResponse.json({
      success: true,
      message: 'Team member updated successfully.',
      teamMember: updated
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update team member.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Team member ID required.' }, { status: 400 });
    }

    const deleted = await deleteTeamMember(id);
    return NextResponse.json({
      success: deleted,
      message: deleted ? 'Team member deleted.' : 'Failed to delete team member.'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete team member.' },
      { status: 500 }
    );
  }
}
