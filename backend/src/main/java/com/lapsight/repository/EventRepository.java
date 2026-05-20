package com.lapsight.repository;

import com.lapsight.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findAllByTeamIdOrderByStartDateDesc(Long teamId);

    Optional<Event> findByIdAndTeamId(Long id, Long teamId);
}
