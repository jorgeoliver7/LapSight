package com.lapsight.controller;

import com.lapsight.dto.UserCreateRequest;
import com.lapsight.dto.UserDto;
import com.lapsight.dto.UserUpdateRequest;
import com.lapsight.model.User;
import com.lapsight.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> list(@AuthenticationPrincipal User current) {
        return ResponseEntity.ok(userService.findAllByTeam(current.getTeam().getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> get(@PathVariable Long id, @AuthenticationPrincipal User current) {
        return ResponseEntity.ok(userService.findByIdInTeam(id, current.getTeam().getId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<UserDto> create(@Valid @RequestBody UserCreateRequest request,
                                          @AuthenticationPrincipal User current) {
        return ResponseEntity.ok(userService.create(current.getTeam().getId(), request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<UserDto> update(@PathVariable Long id,
                                          @Valid @RequestBody UserUpdateRequest request,
                                          @AuthenticationPrincipal User current) {
        return ResponseEntity.ok(userService.update(id, current.getTeam().getId(), request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User current) {
        if (id.equals(current.getId())) {
            throw new IllegalArgumentException("You cannot deactivate your own account");
        }
        userService.deactivate(id, current.getTeam().getId());
        return ResponseEntity.noContent().build();
    }
}
