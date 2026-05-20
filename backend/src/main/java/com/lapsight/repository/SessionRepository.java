package com.lapsight.repository;

import com.lapsight.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    List<Session> findAllByTeamIdOrderBySessionDateDesc(Long teamId);

    Optional<Session> findByIdAndTeamId(Long id, Long teamId);
}
