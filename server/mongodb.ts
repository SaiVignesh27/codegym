import { MongoClient, Collection, ObjectId } from 'mongodb';
import * as bcrypt from 'bcrypt';
import { 
  User, Course, Class, Test, Assignment, Result, 
  InsertUser, InsertCourse, InsertClass, InsertTest, InsertAssignment, InsertResult,
  userSchema, courseSchema, classSchema, testSchema, assignmentSchema, resultSchema
} from '@shared/schema';
import { IStorage } from './storage';

export class MongoDBStorage implements IStorage {
  private client: MongoClient;
  private dbName = 'codegym';
  private connected = false;
  
  // Collections
  private users: Collection<User>;
  private courses: Collection<Course>;
  private classes: Collection<Class>;
  private tests: Collection<Test>;
  private assignments: Collection<Assignment>;
  private results: Collection<Result>;
  private courseProgress: Collection<CourseProgress>;
  
  constructor(uri: string) {
    this.client = new MongoClient(uri);
  }
  
  async connect(): Promise<void> {
    if (this.connected) return;
    
    try {
      await this.client.connect();
      console.log('Connected to MongoDB Atlas');
      
      const db = this.client.db(this.dbName);
      
      // Initialize collections
      this.users = db.collection('users');
      this.courses = db.collection('courses');
      this.classes = db.collection('classes');
      this.tests = db.collection('tests');
      this.assignments = db.collection('assignments');
      this.results = db.collection('results');
      this.courseProgress = db.collection('courseProgress');
      
      // Create indexes
      await this.users.createIndex({ email: 1 }, { unique: true });
      await this.courses.createIndex({ createdBy: 1 });
      await this.classes.createIndex({ courseId: 1 });
      await this.tests.createIndex({ courseId: 1 });
      await this.assignments.createIndex({ courseId: 1 });
      await this.results.createIndex({ studentId: 1 });
      
      this.connected = true;
      
      // Check if admin user exists, if not seed it
      await this.seedAdminUser();
      
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
  
  async close(): Promise<void> {
    if (!this.connected) return;
    
    await this.client.close();
    this.connected = false;
    console.log('Disconnected from MongoDB Atlas');
  }
  
  private async seedAdminUser() {
    // Check if admin user exists
    const adminExists = await this.users.findOne({ email: 'admin@codegym.com' });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin: User = {
        _id: new ObjectId().toString(),
        name: 'Admin User',
        email: 'admin@codegym.com',
        password: hashedPassword,
        role: 'admin'
      };
      
      await this.users.insertOne(admin);
      console.log('Admin user seeded');
      
      // Also seed a student user for testing
      const studentPassword = await bcrypt.hash('student123', 10);
      
      const student: User = {
        _id: new ObjectId().toString(),
        name: 'Student User',
        email: 'student@codegym.com',
        password: studentPassword,
        role: 'student'
      };
      
      await this.users.insertOne(student);
      console.log('Student user seeded');
    }
  }
  
  // User methods
  async getUser(id: string): Promise<User | null> {
    await this.connect();
    return this.users.findOne({ _id: id });
  }
  
  async getUserByEmail(email: string): Promise<User | null> {
    await this.connect();
    return this.users.findOne({ email });
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    await this.connect();
    
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user: User = {
      _id: new ObjectId().toString(),
      ...userData,
      password: hashedPassword
    };
    
    await this.users.insertOne(user);
    return user;
  }
  
  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    await this.connect();
    
    // If password is being updated, hash it
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    const result = await this.users.findOneAndUpdate(
      { _id: id },
      { $set: userData },
      { returnDocument: 'after' }
    );
    
    return result || null;
  }
  
  async deleteUser(id: string): Promise<boolean> {
    await this.connect();
    
    const result = await this.users.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
  
  async listUsers(role?: 'admin' | 'student'): Promise<User[]> {
    await this.connect();
    
    const query = role ? { role } : {};
    return this.users.find(query).toArray();
  }
  
  // Course methods
  async getCourse(id: string): Promise<Course | null> {
    await this.connect();
    return this.courses.findOne({ _id: id });
  }
  
  async createCourse(courseData: InsertCourse): Promise<Course> {
    await this.connect();
    
    const course: Course = {
      _id: new ObjectId().toString(),
      ...courseData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await this.courses.insertOne(course);
    return course;
  }
  
  async updateCourse(id: string, courseData: Partial<Course>): Promise<Course | null> {
    await this.connect();
    
    // Update the updatedAt field
    courseData.updatedAt = new Date();
    
    const result = await this.courses.findOneAndUpdate(
      { _id: id },
      { $set: courseData },
      { returnDocument: 'after' }
    );
    
    return result || null;
  }
  
  async deleteCourse(id: string): Promise<boolean> {
    await this.connect();
    
    const result = await this.courses.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
  
  async listCourses(options?: { visibility?: 'public' | 'private', createdBy?: string }): Promise<Course[]> {
    await this.connect();
    
    const query: any = {};
    
    if (options?.visibility) {
      query.visibility = options.visibility;
    }
    
    if (options?.createdBy) {
      query.createdBy = options.createdBy;
    }
    
    return this.courses.find(query).toArray();
  }
  
  // Class methods
  async getClass(id: string): Promise<Class | null> {
    await this.connect();
    return this.classes.findOne({ _id: id });
  }
  
  async createClass(classData: InsertClass): Promise<Class> {
    await this.connect();
    
    const classEntity: Class = {
      _id: new ObjectId().toString(),
      ...classData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await this.classes.insertOne(classEntity);
    return classEntity;
  }
  
  async updateClass(id: string, classData: Partial<Class>): Promise<Class | null> {
    await this.connect();
    
    // Update the updatedAt field
    classData.updatedAt = new Date();
    
    const result = await this.classes.findOneAndUpdate(
      { _id: id },
      { $set: classData },
      { returnDocument: 'after' }
    );
    
    return result || null;
  }
  
  async deleteClass(id: string): Promise<boolean> {
    await this.connect();
    
    const result = await this.classes.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
  
  async listClasses(options?: { courseId?: string, visibility?: 'public' | 'private', createdBy?: string }): Promise<Class[]> {
    await this.connect();
    
    const query: any = {};
    
    if (options?.courseId) {
      query.courseId = options.courseId;
    }
    
    if (options?.visibility) {
      query.visibility = options.visibility;
    }
    
    if (options?.createdBy) {
      query.createdBy = options.createdBy;
    }
    
    return this.classes.find(query).toArray();
  }
  
  // Test methods
  async getTest(id: string): Promise<Test | null> {
    await this.connect();
    return this.tests.findOne({ _id: id });
  }
  
  async createTest(testData: InsertTest): Promise<Test> {
    await this.connect();
    
    const test: Test = {
      _id: new ObjectId().toString(),
      ...testData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await this.tests.insertOne(test);
    return test;
  }
  
  async updateTest(id: string, testData: Partial<Test>): Promise<Test | null> {
    await this.connect();
    
    // Update the updatedAt field
    testData.updatedAt = new Date();
    
    const result = await this.tests.findOneAndUpdate(
      { _id: id },
      { $set: testData },
      { returnDocument: 'after' }
    );
    
    return result || null;
  }
  
  async deleteTest(id: string): Promise<boolean> {
    await this.connect();
    
    const result = await this.tests.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
  
  async listTests(options?: { courseId?: string, classId?: string, visibility?: 'public' | 'private', createdBy?: string }): Promise<Test[]> {
    await this.connect();
    
    const query: any = {};
    
    if (options?.courseId) {
      query.courseId = options.courseId;
    }
    
    if (options?.classId) {
      query.classId = options.classId;
    }
    
    if (options?.visibility) {
      query.visibility = options.visibility;
    }
    
    if (options?.createdBy) {
      query.createdBy = options.createdBy;
    }
    
    return this.tests.find(query).toArray();
  }
  
  // Assignment methods
  async getAssignment(id: string): Promise<Assignment | null> {
    await this.connect();
    return this.assignments.findOne({ _id: id });
  }
  
  async createAssignment(assignmentData: InsertAssignment): Promise<Assignment> {
    await this.connect();
    
    const assignment: Assignment = {
      _id: new ObjectId().toString(),
      ...assignmentData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await this.assignments.insertOne(assignment);
    return assignment;
  }
  
  async updateAssignment(id: string, assignmentData: Partial<Assignment>): Promise<Assignment | null> {
    await this.connect();
    
    // Update the updatedAt field
    assignmentData.updatedAt = new Date();
    
    const result = await this.assignments.findOneAndUpdate(
      { _id: id },
      { $set: assignmentData },
      { returnDocument: 'after' }
    );
    
    return result || null;
  }
  
  async deleteAssignment(id: string): Promise<boolean> {
    await this.connect();
    
    const result = await this.assignments.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
  
  async listAssignments(options?: { courseId?: string, visibility?: 'public' | 'private', createdBy?: string }): Promise<Assignment[]> {
    await this.connect();
    
    const query: any = {};
    
    if (options?.courseId) {
      query.courseId = options.courseId;
    }
    
    if (options?.visibility) {
      query.visibility = options.visibility;
    }
    
    if (options?.createdBy) {
      query.createdBy = options.createdBy;
    }
    
    return this.assignments.find(query).toArray();
  }
  
  // Result methods
  async getResult(id: string): Promise<Result | null> {
    await this.connect();
    return this.results.findOne({ _id: id });
  }
  
  async createResult(resultData: InsertResult): Promise<Result> {
    await this.connect();
    
    const result: Result = {
      _id: new ObjectId().toString(),
      ...resultData,
    };
    
    await this.results.insertOne(result);
    return result;
  }
  
  async updateResult(id: string, resultData: Partial<Result>): Promise<Result | null> {
    await this.connect();
    
    const updateResult = await this.results.findOneAndUpdate(
      { _id: id },
      { $set: resultData },
      { returnDocument: 'after' }
    );
    
    return updateResult || null;
  }
  
  async deleteResult(id: string): Promise<boolean> {
    await this.connect();
    
    const result = await this.results.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
  
  async listResults(options?: { studentId?: string, courseId?: string, testId?: string, assignmentId?: string }): Promise<Result[]> {
    await this.connect();
    
    const query: any = {};
    
    if (options?.studentId) {
      query.studentId = options.studentId;
    }
    
    if (options?.courseId) {
      query.courseId = options.courseId;
    }
    
    if (options?.testId) {
      query.testId = options.testId;
    }
    
    if (options?.assignmentId) {
      query.assignmentId = options.assignmentId;
    }
    
    return this.results.find(query).toArray();
  }

  // Course Progress methods
  async getCourseProgress(id: string): Promise<CourseProgress | null> {
    await this.connect();
    return this.courseProgress.findOne({ _id: id });
  }

  async getCourseProgressByStudentAndCourse(studentId: string, courseId: string): Promise<CourseProgress | null> {
    await this.connect();
    return this.courseProgress.findOne({ studentId, courseId });
  }

  async createCourseProgress(progressData: InsertCourseProgress): Promise<CourseProgress> {
    await this.connect();
    const now = new Date();
    const progress: CourseProgress = {
      ...progressData,
      createdAt: now,
      updatedAt: now
    };
    const result = await this.courseProgress.insertOne(progress);
    return { ...progress, _id: result.insertedId.toString() };
  }

  async updateCourseProgress(id: string, progressData: Partial<CourseProgress>): Promise<CourseProgress | null> {
    await this.connect();
    const update = {
      ...progressData,
      updatedAt: new Date()
    };
    const result = await this.courseProgress.findOneAndUpdate(
      { _id: id },
      { $set: update },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  async deleteCourseProgress(id: string): Promise<boolean> {
    await this.connect();
    const result = await this.courseProgress.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async listCourseProgress(options?: { studentId?: string, courseId?: string }): Promise<CourseProgress[]> {
    await this.connect();
    const query: any = {};
    
    if (options?.studentId) {
      query.studentId = options.studentId;
    }
    
    if (options?.courseId) {
      query.courseId = options.courseId;
    }
    
    return this.courseProgress.find(query).toArray();
  }
}