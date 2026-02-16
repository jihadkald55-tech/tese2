import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST: إنشاء تعيين جديد (ربط طالب بمشرف)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, supervisorId, researchId, assignedBy } = body;

    if (!studentId || !supervisorId) {
      return NextResponse.json(
        { error: "معرف الطالب والمشرف مطلوب" },
        { status: 400 },
      );
    }

    // إنشاء التعيين
    const { data: assignment, error } = await supabase
      .from("supervisor_assignments")
      .insert({
        student_id: studentId,
        supervisor_id: supervisorId,
        research_id: researchId,
        assigned_by: assignedBy,
      })
      .select(
        `
        *,
        student:users!supervisor_assignments_student_id_fkey(name),
        supervisor:users!supervisor_assignments_supervisor_id_fkey(name)
      `,
      )
      .single();

    if (error) {
      console.error("خطأ في إنشاء التعيين:", error);
      return NextResponse.json({ error: "فشل إنشاء التعيين" }, { status: 500 });
    }

    // إرسال إشعارات
    await Promise.all([
      supabase.from("notifications").insert({
        user_id: studentId,
        title: "🎓 تم تعيين مشرف لك",
        message: `تم تعيين د. ${assignment.supervisor.name} كمشرف على بحثك`,
        type: "success",
      }),
      supabase.from("notifications").insert({
        user_id: supervisorId,
        title: "👨‍🎓 طالب جديد",
        message: `تم تعيين الطالب ${assignment.student.name} لك`,
        type: "info",
      }),
    ]);

    return NextResponse.json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error("خطأ:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

// GET: جلب التعيينات
export async function GET() {
  try {
    const { data: assignments, error } = await supabase
      .from("supervisor_assignments")
      .select(
        `
        *,
        student:users!supervisor_assignments_student_id_fkey(*),
        supervisor:users!supervisor_assignments_supervisor_id_fkey(*),
        research:research_projects(*)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("خطأ في جلب التعيينات:", error);
      return NextResponse.json({ error: "فشل جلب التعيينات" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      assignments: assignments || [],
    });
  } catch (error) {
    console.error("خطأ:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

// DELETE: حذف تعيين
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("id");

    if (!assignmentId) {
      return NextResponse.json(
        { error: "معرف التعيين مطلوب" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("supervisor_assignments")
      .delete()
      .eq("id", assignmentId);

    if (error) {
      console.error("خطأ في حذف التعيين:", error);
      return NextResponse.json({ error: "فشل حذف التعيين" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("خطأ:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
