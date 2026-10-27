package com.example.server.support;

import com.cloudinary.Cloudinary;
import com.example.server.UserProfile.Service.CloudinaryService;
import com.example.server.UserProfile.repository.OrganizationRepository;
import com.example.server.admin.repository.TicketRepository;
import com.example.server.course.proxy.CourseProxy;
import com.example.server.job.Proxy.CompatibilityProxy;
import com.example.server.job.Proxy.InterviewProxy;
import com.example.server.job.Proxy.JobProxy;
import com.example.server.notification.Proxy.NotificationProxy;
import com.example.server.resume.Proxy.ResumeJsonProxy;
import com.example.server.resume.Proxy.ResumeProxy;
import com.example.server.security.JWT.JwtService;
import com.example.server.security.repository.ConfirmationTokenRepository;
import com.example.server.security.repository.RoleRepository;
import com.example.server.security.models.userEntity;
import com.example.server.security.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Base class for full-application integration tests.
 * <p>
 * The whole Spring context (security filter chain, controllers, services, exception handler) is real.
 * Everything that would leave the JVM is replaced: Mongo repositories (Mongo auto-config is excluded in
 * application-test.properties), the SMTP sender and every Feign proxy. All subclasses share one cached context.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class AbstractIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;
    @Autowired
    protected JwtService jwtService;

    @MockitoBean
    protected UserRepository userRepository;
    @MockitoBean
    protected RoleRepository roleRepository;
    @MockitoBean
    protected ConfirmationTokenRepository confirmationTokenRepository;
    @MockitoBean
    protected OrganizationRepository organizationRepository;
    @MockitoBean
    protected TicketRepository ticketRepository;

    @MockitoBean
    protected JavaMailSender javaMailSender;
    @MockitoBean
    protected Cloudinary cloudinary;
    @MockitoBean
    protected CloudinaryService cloudinaryService;

    @MockitoBean
    protected CourseProxy courseProxy;
    @MockitoBean
    protected JobProxy jobProxy;
    @MockitoBean
    protected InterviewProxy interviewProxy;
    @MockitoBean
    protected CompatibilityProxy compatibilityProxy;
    @MockitoBean
    protected NotificationProxy notificationProxy;
    @MockitoBean
    protected ResumeProxy resumeProxy;
    @MockitoBean
    protected ResumeJsonProxy resumeJsonProxy;

    /** Makes the user repository know a verified user with the given roles (defaults to USER) and returns it. */
    protected userEntity givenUser(String email, String... roles) {
        userEntity user = TestDataFactory.user(email, roles.length == 0 ? new String[]{"USER"} : roles);
        org.mockito.Mockito.when(userRepository.findByEmail(email)).thenReturn(java.util.Optional.of(user));
        org.mockito.Mockito.when(userRepository.findById(user.getId())).thenReturn(java.util.Optional.of(user));
        return user;
    }

    /** A valid "Authorization" header value for the given user email, signed by the application's key. */
    protected String bearer(String email) {
        return "Bearer " + JwtTestUtil.validToken(email);
    }
}
