import { api } from "@/shared/lib/http-client";
import type {
  CreateReminderBody,
  ReminderApiRecord,
  UpdateReminderBody,
} from "../lib/reminder-mappers";
import { reminderFromApi } from "../lib/reminder-mappers";
import type { Reminder } from "@/types";

export async function listReminders(): Promise<Reminder[]> {
  const { data } = await api.get<ReminderApiRecord[]>("/reminders");
  return data.map(reminderFromApi);
}

export async function createReminder(
  body: CreateReminderBody
): Promise<Reminder> {
  const { data } = await api.post<ReminderApiRecord>("/reminders", body);
  return reminderFromApi(data);
}

export async function updateReminder(
  id: string,
  body: UpdateReminderBody
): Promise<Reminder> {
  const { data } = await api.patch<ReminderApiRecord>(`/reminders/${id}`, body);
  return reminderFromApi(data);
}

export async function deleteReminder(id: string): Promise<void> {
  await api.delete(`/reminders/${id}`);
}
