import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui";
import { categories, filterCategories } from "@/components/home/categories";

const steps = [
  {
    icon: "search" as const,
    title: "Chọn điều bạn cần",
    text: "Tìm nhóm thiết bị phù hợp với kế hoạch và thời gian sử dụng.",
  },
  {
    icon: "calendar" as const,
    title: "Thống nhất lịch thuê",
    text: "Kiểm tra lịch, giá thuê và khoản cọc trước khi gửi yêu cầu.",
  },
  {
    icon: "camera" as const,
    title: "Nhận đồ, ghi tình trạng",
    text: "Kiểm tra thiết bị và ghi nhận tình trạng khi nhận, khi trả.",
  },
  {
    icon: "shield" as const,
    title: "Trả đồ, đối soát cọc",
    text: "Khoản cọc được đối soát theo biên bản và quy định của lượt thuê.",
  },
];

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const query = typeof params?.q === "string" ? params.q.slice(0, 120) : "";
  const category = typeof params?.category === "string" ? params.category : "";
  const matches = filterCategories(query, category);
  const selected = categories.find((item) => item.id === category);
  const filtered = Boolean(query || category);
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-kicker">
            <span />
            Cho những kế hoạch đáng nhớ
          </span>
          <h1>
            Thuê thiết bị,
            <br />
            đừng mua hẳn.
          </h1>
          <p>
            Một chuyến đi. Một thước phim. Một dự án nhỏ.
            <br className="desktop-break" /> Có đồ bạn cần, mà không cần mua tất
            cả.
          </p>
          <div className="hero-actions">
            <Link className="action-link action-primary" href="#danh-muc">
              Khám phá danh mục
              <Icon name="arrow" size={18} />
            </Link>
            <Link className="hero-secondary" href="#cach-hoat-dong">
              GearLoop hoạt động thế nào?
            </Link>
          </div>
          <div className="hero-assurance">
            <Icon name="shield" size={18} />
            Lịch thuê rõ ràng. Tiền cọc minh bạch.
          </div>
        </div>
        <div className="hero-photo">
          <Image
            src="/images/camera.jpg"
            alt="Máy ảnh và ống kính cho những kế hoạch sáng tạo"
            fill
            priority
            sizes="(max-width: 700px) 100vw, 55vw"
          />
          <div className="hero-photo-caption">
            <span>Cho góc nhìn của riêng bạn</span>
            <strong>
              Mượn thiết bị.
              <br />
              Giữ lại trải nghiệm.
            </strong>
            <span className="photo-credit">Ảnh minh họa danh mục</span>
          </div>
        </div>
      </section>

      <div className="page-width">
        <div className="benefit-strip">
          <div>
            <Icon name="calendar" />
            <span>
              <strong>Thuê theo nhu cầu</strong>
              <small>Chọn khoảng ngày bạn cần</small>
            </span>
          </div>
          <div>
            <Icon name="shield" />
            <span>
              <strong>Rõ ràng khoản cọc</strong>
              <small>Ghi nhận và đối soát từng khoản</small>
            </span>
          </div>
          <div>
            <Icon name="check" />
            <span>
              <strong>Kiểm tra lúc nhận & trả</strong>
              <small>Biên bản đi cùng mỗi lượt thuê</small>
            </span>
          </div>
        </div>

        <section
          className="category-section"
          id="danh-muc"
          aria-labelledby="category-heading"
        >
          <div className="section-heading">
            <div>
              <span className="section-caption">
                Bắt đầu từ điều bạn muốn làm
              </span>
              <h2 id="category-heading">
                {selected ? selected.name : "Thiết bị cho mọi kế hoạch"}
              </h2>
            </div>
            {filtered ? (
              <Link className="text-link" href="/#danh-muc">
                Xem tất cả danh mục
                <Icon name="arrow" size={16} />
              </Link>
            ) : (
              <span className="section-note">Chọn một nhóm để tìm hiểu</span>
            )}
          </div>
          {query && (
            <p className="search-summary" role="status">
              Danh mục phù hợp với “{query}”
            </p>
          )}
          {matches.length ? (
            <div className="category-grid">
              {matches.map((item) => (
                <article
                  className={"category-card category-" + item.id}
                  key={item.id}
                >
                  <Link
                    className="category-photo"
                    href={`/?category=${item.id}#danh-muc`}
                    aria-label={`Tìm hiểu ${item.name}`}
                  >
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 700px) 100vw, 33vw"
                    />
                    <span className="category-photo-badge">
                      <Icon name={item.icon} size={21} />
                    </span>
                  </Link>
                  <div className="category-copy">
                    <p>{item.short}</p>
                    <h3>{item.name}</h3>
                    <ul>
                      {item.suggestions.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                    <Link
                      className="category-link"
                      href={`/?category=${item.id}#danh-muc`}
                    >
                      Tìm hiểu danh mục
                      <Icon name="arrow" size={17} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Chưa tìm thấy danh mục phù hợp"
              description="Thử từ khóa như máy ảnh, cắm trại hoặc dụng cụ để khám phá các nhóm thiết bị."
              action={
                <Link className="action-link action-primary" href="/#danh-muc">
                  Xem tất cả danh mục
                </Link>
              }
            />
          )}
          {selected && matches.length > 0 && (
            <div className="category-detail" role="status">
              <Icon name={selected.icon} size={30} />
              <div>
                <h3>{selected.description}</h3>
                <p>
                  Danh sách tin cho thuê chưa mở trong bản trải nghiệm này. Bạn
                  có thể đăng nhập và tìm hiểu quy trình thuê bên dưới.
                </p>
              </div>
              <Link className="action-link action-outline" href="/login">
                Đến tài khoản
                <Icon name="user" size={16} />
              </Link>
            </div>
          )}
        </section>

        <section className="outdoor-banner">
          <div className="outdoor-banner-photo">
            <Image
              src="/images/camping.jpg"
              alt="Ánh sáng xuyên qua tán rừng"
              fill
              sizes="(max-width: 700px) 100vw, 50vw"
            />
          </div>
          <div className="outdoor-banner-copy">
            <span>Cuối tuần này, đi đâu đó nhé?</span>
            <h2>
              Đổi không khí.
              <br />
              Không cần đổi cả tủ đồ.
            </h2>
            <p>
              Khám phá nhóm đồ cắm trại và dã ngoại để chuẩn bị cho một chuyến
              đi nhẹ nhàng hơn.
            </p>
            <Link
              href="/?category=outdoor#danh-muc"
              className="action-link action-light"
            >
              Khám phá đồ dã ngoại
              <Icon name="arrow" size={18} />
            </Link>
          </div>
        </section>

        <section
          className="how-section"
          id="cach-hoat-dong"
          aria-labelledby="how-heading"
        >
          <div className="section-heading">
            <div>
              <span className="section-caption">
                Từ kế hoạch đến trải nghiệm
              </span>
              <h2 id="how-heading">Thuê cùng GearLoop, từng bước rõ ràng</h2>
            </div>
          </div>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <article className="step" key={step.title}>
                <div className="step-top">
                  <span className="step-icon">
                    <Icon name={step.icon} size={24} />
                  </span>
                  <span className="step-number">0{index + 1}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="deposit-section" id="tien-coc">
          <div className="deposit-mark">
            <Icon name="shield" size={48} />
          </div>
          <div>
            <h2>Khoản cọc cần rõ ràng từ đầu.</h2>
            <p>
              Xem mức cọc trước khi thuê. Kiểm tra tình trạng khi giao nhận. Có
              biên bản để hai bên cùng đối chiếu khi cần.
            </p>
          </div>
          <Link href="/login" className="action-link action-outline">
            Tài khoản của bạn
            <Icon name="arrow" size={17} />
          </Link>
        </section>
      </div>
    </>
  );
}
