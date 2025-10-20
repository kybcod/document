package hello.document.config;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Component
public class WebConfig implements WebMvcConfigurer{

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(new LoginInterceptor())
				.order(1)
				.addPathPatterns("/**") // 모든 요청 체크
				.excludePathPatterns(
						"/login",     // 로그인 페이지
						"/logout",    // 로그아웃
						"/user/loginck",   // 로그인 처리
						"/user/changePassword",   // 암호 초기화
						"/css/**", "/js/**", "/images/**", "/font/**" // 정적 리소스
				);
	}


}
