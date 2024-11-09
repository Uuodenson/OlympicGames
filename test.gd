func move(delta):
    var desired_step: Vector2 = input_direction * TileSize / 2
    
    # Präventive Kollisionsprüfung für den gesamten Schritt
    raycast.target_position = desired_step
    if raycast.is_colliding():
        # Wenn eine Kollision für den gesamten Schritt besteht, bewegen wir uns nicht
        is_moving = false
        return

    # Andernfalls berechnen wir die Bewegung in kleinen Schritten
    var step_size: float = WalkSpeed * delta
    var remaining_step: float = step_size
    while remaining_step > 0.001: # Kleine Schwelle, um endlose Schleifen zu vermeiden
        raycast.target_position = desired_step * (1.0 - remaining_step / step_size)
        if raycast.is_colliding():
            # Wenn eine Kollision während eines kleinen Schritts auftritt, gleiten wir entlang der Wand
            var collision_normal = raycast.get_collision_normal()
            var projected_movement = desired_step.project(collision_normal.rotated(PI / 2))
            Player.position += projected_movement * remaining_step
            remaining_step = 0.0
        else:
            # Wenn keine Kollision, bewegen wir uns um den vollen kleinen Schritt
            Player.position += desired_step * (step_size - remaining_step)
            remaining_step = 0.0

    # Aktualisiere die prozentuale Bewegung für den nächsten Schritt
    percent_moved_to_next_tile += step_size
    if percent_moved_to_next_tile >= 1.0:
        percent_moved_to_next_tile = 0.0
        is_moving = false