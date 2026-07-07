package com.aicaptioneditor.modules.user.provider;

import com.aicaptioneditor.modules.auth.model.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service("localUserProvider")
@Slf4j
public class LocalUserProvider implements UserProvider {

    @Override
    public void onDeleteUser(User user) {
        log.info("Performing local cleanup for user: {}", user.getEmail());
        // Custom local user deletion logic if any (cascades on database handle projects/tokens)
    }
}
