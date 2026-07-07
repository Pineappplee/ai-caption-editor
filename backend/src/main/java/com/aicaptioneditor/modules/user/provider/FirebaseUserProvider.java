package com.aicaptioneditor.modules.user.provider;

import com.aicaptioneditor.modules.auth.model.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service("firebaseUserProvider")
@Slf4j
public class FirebaseUserProvider implements UserProvider {

    @Override
    public void onDeleteUser(User user) {
        log.info("Performing Firebase deletion cleanup for user: {}", user.getEmail());
        // Custom Firebase User Admin API deletion logic can be wired here in the future
    }
}
