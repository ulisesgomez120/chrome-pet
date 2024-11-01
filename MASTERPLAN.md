# Chrome Extension Virtual Pet - Development Masterplan

## Overview

A Chrome extension that adds an interactive animated character to the user's browsing experience. The character (initially a cat) will move around the webpage, interact with HTML elements, and develop its personality based on interactions. The extension will feature both free and premium tiers, with a focus on creating a delightful, personalized experience.

## MVP Core Features

### Character System

- **Base Character (Cat)**

  - Fully animated 2D sprite-based character
  - Smooth transitions between animations
  - Core animation sets:
    - Walking/running
    - Idle animations
    - Napping
    - Climbing
    - Interaction animations (pawing, playing)
    - Spawn/despawn effects (smoke poof)

- **Personality System**
  - Random generation on character creation
  - Core traits:
    - Playfulness (affects interaction frequency)
    - Energy Level (affects movement speed and rest periods)
    - Friendliness (affects reaction to user interaction)
  - Trait evolution based on interactions
  - Color/Pattern Generation:
    - Regular variations
    - Shiny variations (1/4096 chance)

### Interaction System

- **Environmental Interactions**

  - Walking/running across elements
  - Climbing scroll bars
  - Napping on headings/divs with hanging tail
  - Following scroll direction with running animation
  - Respawning after dynamic page changes
  - Interaction with video players (napping on top)

- **User Interactions**
  - Clicking to pet
  - Character response to petting based on personality
  - Friendship level development

### Technical Architecture

```typescript
// Core State Management
interface CharacterState {
  position: Vector2D;
  currentAction: Action;
  personality: PersonalityTraits;
  stats: CharacterStats;
  appearance: CharacterAppearance;
}

// Personality System
interface PersonalityTraits {
  playfulness: number; // 0-100
  energyLevel: number; // 0-100
  friendliness: number; // 0-100
  // Extensible for future traits
}

// Action System
type Action = {
  type: ActionType;
  duration: number;
  target?: HTMLElement;
  animation: AnimationSequence;
};

// Stats Tracking
interface CharacterStats {
  totalPets: number;
  favoriteSleepingSpots: Map<string, number>;
  achievementsCompleted: Achievement[];
  timeActive: number;
}
```

### Achievement System

- **Core Achievements**
  - Climbing milestones
  - Petting milestones
  - Time spent active
  - Nap locations discovered
- **Weekly Goals**
  - Petting goals
  - Interaction targets
  - Exploration objectives

### User Interface

- **Character Tab**

  - Current character display
  - Quick mute toggle
  - Basic stats display
  - Character selection (saved characters)

- **Settings Tab**
  - Audio volume control
  - Tab following toggle
  - Movement speed preferences
  - Interaction frequency settings

### Data Management

- **Local Storage**
  - Character save slots (1 per free character)
  - Achievement progress
  - User preferences
  - Premium status

### Monetization

- **Free Tier**

  - Access to 6 default characters
  - One save slot per character
  - Full personality system
  - Basic achievements

- **Premium Features**
  - Access to all characters
  - 5 save slots per character
  - Option to purchase additional save slots
  - Additional achievement rewards
  - Cross-tab following feature

## Technical Implementation

### Frontend Stack

- Next.js 15 with TypeScript
- Tailwind CSS for UI components
- shadcn/ui for component library
- Sprite-based animation system

### Backend Services

- Bun for API endpoints
- Stripe integration for payments
- User authentication system
- Character state persistence

### Extension Architecture

```typescript
// Main Extension Component
export default function PetExtension() {
  const [character, setCharacter] = useState<Character>();
  const [settings, setSettings] = useState<Settings>();

  // Character position management
  const handleScroll = useCallback((event: Event) => {
    // Handle scroll-based repositioning
  }, [character]);

  // Animation management
  const updateAnimation = useCallback(() => {
    // Handle sprite updates and transitions
  }, [character]);

  // Interaction handling
  const handleInteraction = useCallback((event: MouseEvent) => {
    // Process user interactions
  }, [character]);

  return (
    <div className="fixed pointer-events-none">
      <CharacterRenderer
        character={character}
        position={position}
        animation={currentAnimation}
      />
      <UI settings={settings} />
    </div>
  );
}
```

## Development Phases

### Phase 1: Core Infrastructure

[x] Basic extension setup
[ ] Character rendering system (current)
[ ] Simple animations
[ ] Basic movement

### Phase 2: Interaction System

- HTML element interaction
- Scroll handling
- Page transition management
- Character state management

### Phase 3: Personality & Progress

- Personality system implementation
- Achievement tracking
- Stats system
- Data persistence

### Phase 4: Monetization

- Stripe integration
- Premium features
- Character save system
- User authentication

## Future Roadmap

### Version 1.1

- Social features (character sharing)
- Popular character gallery
- Additional achievements

### Version 1.2

- Website-specific behaviors
- Enhanced interaction animations
- Extended personality traits

### Version 1.3

- Character preferences system
- Content-aware behaviors
- Advanced animation effects

## Technical Considerations

### Performance

- Efficient sprite rendering
- Optimized collision detection
- Smart animation caching
- Minimal DOM manipulation

### Security

- Secure payment processing
- Safe character state storage
- Protected user data

### Accessibility

- Reduced motion options
- Audio controls
- Clear visual feedback

## Testing Strategy

- Unit tests for core logic
- Animation testing framework
- Performance benchmarking
- Cross-browser compatibility

## Launch Strategy

- Soft launch with limited characters
- Beta testing period
- Gradual feature rollout
- Community feedback integration
