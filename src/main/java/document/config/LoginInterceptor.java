package document.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
public class LoginInterceptor implements HandlerInterceptor {

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

		HttpSession session = request.getSession(false);

		// 세션이 없거나 로그인 사용자 정보가 없는 경우
		if (session == null || session.getAttribute("loginUser") == null) {
			// AJAX 요청일 경우 JSON 응답으로 sessionExpired 반환
			if ("XMLHttpRequest".equals(request.getHeader("X-Requested-With"))) {
				response.setContentType("application/json");
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				response.getWriter().write("{\"sessionExpired\": true}");
			} else {
				// 일반 요청일 경우 로그인 페이지로 리다이렉트
				response.sendRedirect(request.getContextPath() + "/login");
			}
			return false; // 요청 처리 중단
		}

		return true;
	}
}
