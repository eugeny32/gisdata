import './style.css';
import { Engine } from './Engine';

const engine = new Engine();
engine.start();
// Ручка для смоук-тестов (store.entities/store.homeUcs и т.п.) — приложение
// её не использует, ничего не зависит от её наличия.
(window as unknown as { __engine: Engine }).__engine = engine;
