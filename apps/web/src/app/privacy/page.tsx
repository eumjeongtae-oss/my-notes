import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "개인정보 처리방침" };

// 개인정보 보호책임자 연락처. 사용자가 열람, 삭제를 요청하는 곳이라 본문 여러 곳에서 쓴다
const CONTACT_EMAIL = "eumjeongtae@gmail.com";

// /privacy: 개인정보 처리방침. 헤더 없는 공개 페이지 (로그인하지 않아도 열린다. src/proxy.ts의 PUBLIC_PATHS)
// Google 로그인 앱을 공개(프로덕션)하려면 로그인 없이 열리는 처리방침 주소가 필요하다.
// 수집 항목이나 저장 위치(AWS 리전)가 바뀌면 이 페이지와 시행일을 함께 고친다.
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" aria-label="차곡 홈">
        <Logo />
      </Link>

      <article className="prose mt-10 max-w-none break-keep prose-zinc">
        <h1>개인정보 처리방침</h1>
        <p>
          차곡(chagoknotes.com, 이하 &ldquo;차곡&rdquo;)은 개인이 운영하는
          마크다운 노트 서비스입니다. 차곡은 이용자의 개인정보를 소중히 다루며,
          서비스에 꼭 필요한 정보만 처리합니다.
        </p>

        <h2>1. 처리하는 개인정보</h2>
        <table>
          <thead>
            <tr>
              <th>구분</th>
              <th>항목</th>
              <th>받는 방법</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Google 계정 정보</td>
              <td>
                이메일 주소, 이름, 프로필 사진 주소, Google 계정 고유 번호
              </td>
              <td>Google로 로그인할 때 Google에서 받음</td>
            </tr>
            <tr>
              <td>이용자가 쓴 내용</td>
              <td>노트(제목, 본문), 묶음 이름, 작성 및 수정 시각</td>
              <td>이용자가 직접 입력</td>
            </tr>
            <tr>
              <td>로그인 정보</td>
              <td>로그인 유지용 쿠키와 그 만료 시각</td>
              <td>로그인할 때 자동으로 생성</td>
            </tr>
          </tbody>
        </table>
        <p>
          비밀번호는 받지 않습니다. 로그인은 Google이 처리하고, 차곡은 위의
          Google 계정 정보만 받습니다.
        </p>

        <h2>2. 처리 목적</h2>
        <ul>
          <li>로그인과 이용자 구분</li>
          <li>이용자가 쓴 노트와 묶음을 저장하고 본인에게만 보여 주기</li>
          <li>서비스 장애 대응과 데이터 복구를 위한 백업</li>
        </ul>
        <p>광고, 마케팅, 다른 서비스와의 연결에는 사용하지 않습니다.</p>

        <h2>3. 보유 기간과 파기</h2>
        <ul>
          <li>
            이용자가 삭제를 요청할 때까지 보관하고, 요청을 받으면 지체 없이
            삭제합니다.
          </li>
          <li>로그인 정보(쿠키)는 로그인부터 30일이 지나면 만료됩니다.</li>
          <li>
            장애 복구용 백업은 매일 만들어 30일 동안 보관하고, 30일이 지나면
            자동으로 삭제합니다. 따라서 삭제를 요청한 정보도 백업에는 최대 30일
            동안 남을 수 있습니다.
          </li>
        </ul>

        <h2>4. 제3자 제공</h2>
        <p>
          이용자의 개인정보를 다른 사람이나 회사에 제공하거나 판매하지 않습니다.
          다만 법령에 따라 수사기관 등이 정해진 절차로 요구하는 경우는
          예외입니다.
        </p>

        <h2>5. 처리 위탁과 국외 이전</h2>
        <p>
          차곡은 서버와 데이터 보관을 Amazon Web Services에 맡기고 있으며, 이에
          따라 개인정보가 <strong>국외(호주)</strong>에 저장됩니다.
        </p>
        <table>
          <tbody>
            <tr>
              <th>이전받는 자</th>
              <td>Amazon Web Services, Inc.</td>
            </tr>
            <tr>
              <th>이전되는 국가</th>
              <td>호주 (AWS 아시아 태평양 시드니 리전)</td>
            </tr>
            <tr>
              <th>이전 시기와 방법</th>
              <td>서비스를 이용할 때마다 암호화된 네트워크(HTTPS)로 전송</td>
            </tr>
            <tr>
              <th>이전 항목</th>
              <td>1번의 모든 항목</td>
            </tr>
            <tr>
              <th>이전 목적</th>
              <td>서비스 운영을 위한 서버와 데이터베이스, 백업 보관</td>
            </tr>
            <tr>
              <th>보유 기간</th>
              <td>3번의 보유 기간과 같음</td>
            </tr>
          </tbody>
        </table>
        <p>
          국외 이전을 원하지 않으면 서비스 이용을 중단하고 아래 연락처로 삭제를
          요청할 수 있습니다. 이 경우 서비스를 이용할 수 없습니다.
        </p>

        <h2>6. 쿠키</h2>
        <p>
          로그인을 유지하는 쿠키 하나만 사용합니다. 이 쿠키는 자바스크립트로
          읽을 수 없게 설정되어 있고, 광고나 방문 추적에는 쓰지 않습니다.
          브라우저 설정에서 쿠키를 막으면 로그인할 수 없습니다.
        </p>

        <h2>7. 이용자의 권리</h2>
        <p>
          이용자는 언제든지 자신의 개인정보를 열람하거나, 정정, 삭제, 처리
          정지를 요청할 수 있습니다. 아직 서비스 안에 탈퇴 기능이 없으므로{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>로 요청해
          주세요. 요청한 분이 계정 주인인지 확인한 뒤 지체 없이 처리합니다.
        </p>

        <h2>8. 안전성 확보 조치</h2>
        <ul>
          <li>모든 통신은 HTTPS로 암호화합니다.</li>
          <li>
            데이터베이스는 인터넷에 열려 있지 않고, 서버 관리 접속은 운영자만 할
            수 있게 막혀 있습니다.
          </li>
          <li>각 이용자는 자신이 쓴 노트와 묶음만 볼 수 있습니다.</li>
        </ul>

        <h2>9. 개인정보 보호책임자</h2>
        <table>
          <tbody>
            <tr>
              <th>이름</th>
              <td>음정태 (운영자)</td>
            </tr>
            <tr>
              <th>연락처</th>
              <td>
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          개인정보 침해에 대한 신고나 상담이 필요하면 개인정보침해신고센터(국번
          없이 118, privacy.kisa.or.kr)에도 문의할 수 있습니다.
        </p>

        <h2>10. 변경</h2>
        <p>
          이 방침이 바뀌면 이 페이지에 알립니다.
          <br />
          시행일: 2026년 10월 8일
        </p>
      </article>
    </main>
  );
}
