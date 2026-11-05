import { z } from "zod";
import { errorMessage } from "../error-catalog";

const message = errorMessage("ERR-USR-003");
const calendarDate = z.string({ required_error: message, invalid_type_error: message })
  .regex(/^\d{4}-\d{2}-\d{2}$/, message).refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, message);

// Ngày UTC dạng YYYY-MM-DD; khoảng đóng, thuê cùng ngày hợp lệ theo data-model.
export const dateRangeSchema = z.object({
  startDate: calendarDate,
  endDate: calendarDate,
}, { required_error: message, invalid_type_error: message })
  .refine(({ startDate, endDate }) => endDate >= startDate, {
    path: ["endDate"],
    message,
  });

export type DateRangeInput = z.infer<typeof dateRangeSchema>;
