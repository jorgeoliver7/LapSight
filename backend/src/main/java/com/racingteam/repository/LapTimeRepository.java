package com.racingteam.repository;

import com.racingteam.model.LapTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LapTimeRepository extends JpaRepository<LapTime, Long> {
}
