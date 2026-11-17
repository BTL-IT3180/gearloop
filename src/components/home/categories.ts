import type { IconName } from "../ui/icon";

export const categories = [
  {
    id: "camera",
    name: "Máy ảnh & quay phim",
    short: "Ghi lại điều đáng nhớ",
    description: "Máy ảnh, ống kính và thiết bị quay cho những góc nhìn mới.",
    image: "/images/camera.jpg",
    alt: "Máy ảnh và ống kính minh họa cho danh mục",
    icon: "camera" as IconName,
    terms: "camera may anh quay phim ong kinh lens chup anh video",
    suggestions: ["Máy ảnh", "Ống kính", "Phụ kiện quay"],
  },
  {
    id: "outdoor",
    name: "Cắm trại & dã ngoại",
    short: "Ra ngoài, thêm trải nghiệm",
    description: "Lều trại và đồ dã ngoại cho chuyến đi cuối tuần của bạn.",
    image: "/images/camping.jpg",
    alt: "Rừng cây minh họa cho hoạt động dã ngoại",
    icon: "tent" as IconName,
    terms: "cam trai da ngoai leu bep tui ngu outdoor camping du lich",
    suggestions: ["Lều trại", "Đồ nấu ngoài trời", "Đèn & phụ kiện"],
  },
  {
    id: "tools",
    name: "Dụng cụ & sửa chữa",
    short: "Bắt tay làm điều bạn muốn",
    description: "Dụng cụ cho dự án nhỏ và những việc cần hoàn thành tại nhà.",
    image: "/images/tools.jpg",
    alt: "Dụng cụ minh họa cho danh mục sửa chữa",
    icon: "tools" as IconName,
    terms: "dung cu sua chua khoan tools sua nha",
    suggestions: ["Dụng cụ cầm tay", "Máy khoan", "Phụ kiện"],
  },
] as const;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}
// Search these editorial categories only; no inventory or availability is implied.
export function filterCategories(query = "", category = "") {
  const words = normalize(query)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
  return categories.filter((item) => {
    const terms = normalize(
      item.name +
        " " +
        item.description +
        " " +
        item.terms +
        " " +
        item.suggestions.join(" "),
    ).split(/[^\p{L}\p{N}]+/u);
    return (
      (!category || item.id === category) &&
      words.every((word) => terms.includes(word))
    );
  });
}
