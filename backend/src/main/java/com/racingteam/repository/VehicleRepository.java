package com.racingteam.repository;

import com.racingteam.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findAllByTeamId(Long teamId);

    Optional<Vehicle> findByIdAndTeamId(Long id, Long teamId);
}
