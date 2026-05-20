package com.lapsight.repository;

import com.lapsight.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    java.util.List<User> findAllByTeamId(Long teamId);

    Optional<User> findByIdAndTeamId(Long id, Long teamId);
}
