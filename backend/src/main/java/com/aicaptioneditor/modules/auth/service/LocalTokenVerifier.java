package com.aicaptioneditor.modules.auth.service;

import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service("localTokenVerifier")
@RequiredArgsConstructor
public class LocalTokenVerifier implements TokenVerifier {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public Authentication verifyToken(String token) {
        String email = jwtService.extractEmail(token);
        if (email != null) {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
            
            if (jwtService.isTokenValid(token, user)) {
                return new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
            }
        }
        return null;
    }
}
