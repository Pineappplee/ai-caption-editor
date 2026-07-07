package com.aicaptioneditor.modules.user.provider;

import com.aicaptioneditor.modules.auth.model.User;

public interface UserProvider {
    void onDeleteUser(User user);
}
