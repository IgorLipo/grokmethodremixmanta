import { supabase } from "@/integrations/supabase/client";

interface NotifyParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export async function notify({ userId, type, title, message, data }: NotifyParams) {
  await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    message,
    data: data || {},
  });
}

// Notify on job status change
export async function notifyStatusChange(
  jobId: string,
  jobTitle: string,
  newStatus: string,
  ownerId?: string | null,
  assignedScaffolderIds?: string[]
) {
  const statusLabels: Record<string, string> = {
    draft: "Draft", submitted: "Submitted", photo_review: "Photo Review",
    quote_pending: "Quote Pending", quote_submitted: "Quote Submitted",
    negotiating: "Negotiating", scheduled: "Scheduled",
    in_progress: "In Progress", completed: "Completed", cancelled: "Cancelled",
  };
  const label = statusLabels[newStatus] || newStatus;
  const msg = `Job "${jobTitle}" status updated to ${label}.`;

  // Notify owner
  if (ownerId) {
    await notify({ userId: ownerId, type: "status_change", title: `Job ${label}`, message: msg, data: { job_id: jobId } });
  }
  // Notify assigned scaffolders
  if (assignedScaffolderIds) {
    for (const sid of assignedScaffolderIds) {
      await notify({ userId: sid, type: "status_change", title: `Job ${label}`, message: msg, data: { job_id: jobId } });
    }
  }
}

// Notify on quote submission
export async function notifyQuoteSubmitted(jobId: string, jobTitle: string, amount: number, ownerId?: string | null) {
  if (!ownerId) return;
  await notify({
    userId: ownerId,
    type: "quote",
    title: "New Quote Received",
    message: `A quote of £${amount.toLocaleString()} has been submitted for "${jobTitle}".`,
    data: { job_id: jobId },
  });
}

// Notify on quote decision
export async function notifyQuoteDecision(scaffolderId: string, jobTitle: string, decision: string, jobId: string) {
  await notify({
    userId: scaffolderId,
    type: "quote",
    title: `Quote ${decision.charAt(0).toUpperCase() + decision.slice(1)}`,
    message: `Your quote for "${jobTitle}" has been ${decision}.`,
    data: { job_id: jobId },
  });
}

// Notify on photo upload
export async function notifyPhotoUploaded(jobId: string, jobTitle: string, adminUserIds: string[]) {
  for (const adminId of adminUserIds) {
    await notify({
      userId: adminId,
      type: "photo",
      title: "Photos Uploaded",
      message: `New photos have been uploaded for job "${jobTitle}". Review pending.`,
      data: { job_id: jobId },
    });
  }
}

// Notify on scaffolder assignment
export async function notifyScaffolderAssigned(scaffolderId: string, jobTitle: string, jobId: string) {
  await notify({
    userId: scaffolderId,
    type: "assignment",
    title: "New Job Assigned",
    message: `You have been assigned to job "${jobTitle}". Review the details and submit a quote.`,
    data: { job_id: jobId },
  });
}
